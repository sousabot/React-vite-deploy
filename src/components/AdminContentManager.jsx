import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../state/auth.jsx";
import {
  fetchSiteContent,
  invalidateSiteContentCache,
  saveSiteContent,
} from "../state/siteContent.js";
import {
  hexToRgb,
  nextNumber,
  parseTags,
  parseTwitchLogin,
  slugify,
} from "../utils/contentHelpers.js";
import ImageUploadField from "./ImageUploadField.jsx";

const TABS = [
  { id: "creators", label: "Creators" },
  { id: "staff", label: "Staff" },
  { id: "partners", label: "Partners" },
];

const EMPTY_CREATOR = {
  name: "",
  handle: "",
  role: "Streamer",
  game: "",
  twitch: "",
  twitchLogin: "",
  instagram: "",
  twitter: "",
  image: "",
  accent: "#ff7a00",
  tags: "Entertainment, Community",
};

const EMPTY_STAFF = {
  departmentId: "",
  name: "",
  role: "",
  game: "",
  image: "",
  initials: "",
  accent: "#ff7a00",
  tags: "",
};

const EMPTY_PARTNER = {
  groupId: "",
  name: "",
  role: "Official Partner",
  description: "",
  website: "",
  logo: "",
  accent: "#ff7a00",
  tags: "",
};

function Field({ label, children, hint }) {
  return (
    <label className="adminFormField">
      <span className="adminFormLabel">{label}</span>
      {children}
      {hint && <span className="adminFormHint muted small">{hint}</span>}
    </label>
  );
}

function snapshotContent(creators, staffDepartments, partnerGroups) {
  return JSON.stringify({ creators, staffDepartments, partnerGroups });
}

export default function AdminContentManager() {
  const { user } = useAuth();
  const [tab, setTab] = useState("creators");
  const [creators, setCreators] = useState([]);
  const [staffDepartments, setStaffDepartments] = useState([]);
  const [partnerGroups, setPartnerGroups] = useState([]);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [creatorForm, setCreatorForm] = useState(EMPTY_CREATOR);
  const [staffForm, setStaffForm] = useState(EMPTY_STAFF);
  const [partnerForm, setPartnerForm] = useState(EMPTY_PARTNER);

  useEffect(() => {
    let cancelled = false;
    fetchSiteContent({ force: true }).then((content) => {
      if (cancelled) return;
      setCreators(content.creators);
      setStaffDepartments(content.staffDepartments);
      setPartnerGroups(content.partnerGroups);
      setSavedSnapshot(
        snapshotContent(
          content.creators,
          content.staffDepartments,
          content.partnerGroups
        )
      );
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const isDirty = useMemo(() => {
    if (!savedSnapshot) return false;
    return (
      snapshotContent(creators, staffDepartments, partnerGroups) !==
      savedSnapshot
    );
  }, [creators, staffDepartments, partnerGroups, savedSnapshot]);

  const departmentOptions = useMemo(
    () =>
      staffDepartments.map((d) => ({
        id: d.id,
        label: `${d.icon} ${d.label}`,
      })),
    [staffDepartments]
  );

  const partnerGroupOptions = useMemo(
    () =>
      partnerGroups.map((g) => ({
        id: g.id,
        label: `${g.icon} ${g.label}`,
      })),
    [partnerGroups]
  );

  function resetForms() {
    setEditingId(null);
    setCreatorForm(EMPTY_CREATOR);
    setStaffForm({
      ...EMPTY_STAFF,
      departmentId: departmentOptions[0]?.id || "",
    });
    setPartnerForm({
      ...EMPTY_PARTNER,
      groupId: partnerGroupOptions[0]?.id || "",
    });
  }

  useEffect(() => {
    if (!loading) {
      setStaffForm((f) => ({
        ...f,
        departmentId: f.departmentId || departmentOptions[0]?.id || "",
      }));
      setPartnerForm((f) => ({
        ...f,
        groupId: f.groupId || partnerGroupOptions[0]?.id || "",
      }));
    }
  }, [loading, departmentOptions, partnerGroupOptions]);

  async function handleSave() {
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const token = await user?.firebaseUser?.getIdToken?.();
      if (!token) throw new Error("You must be logged in to save.");

      await saveSiteContent(
        { creators, staffDepartments, partnerGroups },
        token
      );
      setSavedSnapshot(
        snapshotContent(creators, staffDepartments, partnerGroups)
      );
      setMessage("Content published. Public pages will update on refresh.");
      resetForms();
    } catch (e) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function handleResetDefaults() {
    if (!window.confirm("Reset editor to built-in defaults? This does not publish until you click Save.")) {
      return;
    }
    invalidateSiteContentCache();
    fetchSiteContent({ force: true }).then((content) => {
      setCreators(content.creators);
      setStaffDepartments(content.staffDepartments);
      setPartnerGroups(content.partnerGroups);
      setSavedSnapshot(
        snapshotContent(
          content.creators,
          content.staffDepartments,
          content.partnerGroups
        )
      );
      resetForms();
      setMessage("Loaded built-in defaults into the editor.");
    });
  }

  /* ─── Creators ─── */

  function editCreator(c) {
    setTab("creators");
    setEditingId(c.id);
    setCreatorForm({
      name: c.name || "",
      handle: c.handle || "",
      role: c.role || "",
      game: c.game || "",
      twitch: c.twitch || "",
      twitchLogin: c.twitchLogin || "",
      instagram: c.instagram || "",
      twitter: c.twitter || "",
      image: c.image || "",
      accent: c.accent || "#ff7a00",
      tags: (c.tags || []).join(", "),
    });
  }

  function upsertCreator(e) {
    e.preventDefault();
    if (!creatorForm.name.trim()) return;

    const twitchLogin =
      creatorForm.twitchLogin.trim() ||
      parseTwitchLogin(creatorForm.twitch) ||
      slugify(creatorForm.name);
    const accent = creatorForm.accent || "#ff7a00";
    const entry = {
      id: editingId || slugify(creatorForm.name) || crypto.randomUUID(),
      name: creatorForm.name.trim(),
      handle: creatorForm.handle.trim() || `@${slugify(creatorForm.name)}`,
      role: creatorForm.role.trim() || "Streamer",
      game: creatorForm.game.trim(),
      twitch:
        creatorForm.twitch.trim() ||
        `https://www.twitch.tv/${twitchLogin}`,
      twitchLogin,
      instagram: creatorForm.instagram.trim(),
      twitter: creatorForm.twitter.trim(),
      image: creatorForm.image.trim(),
      accent,
      accentRgb: hexToRgb(accent),
      tags: parseTags(creatorForm.tags),
      number: editingId
        ? creators.find((c) => c.id === editingId)?.number || nextNumber(creators)
        : nextNumber(creators),
    };

    setCreators((prev) => {
      if (editingId) return prev.map((c) => (c.id === editingId ? entry : c));
      return [...prev, entry];
    });
    setMessage("Saved to draft. Click Publish changes to show on the live site.");
    resetForms();
  }

  function deleteCreator(id) {
    if (!window.confirm("Remove this creator?")) return;
    setCreators((prev) => prev.filter((c) => c.id !== id));
    if (editingId === id) resetForms();
  }

  /* ─── Staff ─── */

  function editStaffMember(member, departmentId) {
    setTab("staff");
    setEditingId(member.id);
    setStaffForm({
      departmentId,
      name: member.name || "",
      role: member.role || "",
      game: member.game || "",
      image: member.image || "",
      initials: member.initials || "",
      accent: member.accent || "#ff7a00",
      tags: (member.tags || []).join(", "),
    });
  }

  function upsertStaff(e) {
    e.preventDefault();
    if (!staffForm.name.trim() || !staffForm.departmentId) return;

    const accent = staffForm.accent || "#ff7a00";
    const allMembers = staffDepartments.flatMap((d) => d.members);
    const existing = allMembers.find((m) => m.id === editingId);
    const entry = {
      id: editingId || slugify(staffForm.name) || crypto.randomUUID(),
      name: staffForm.name.trim(),
      role: staffForm.role.trim() || "STAFF",
      game: staffForm.game.trim(),
      image: staffForm.image.trim(),
      initials:
        staffForm.initials.trim() ||
        staffForm.name.trim().slice(0, 2).toUpperCase(),
      accent,
      accentRgb: hexToRgb(accent),
      tags: parseTags(staffForm.tags),
      number: existing?.number || nextNumber(allMembers),
    };

    setStaffDepartments((prev) =>
      prev.map((dept) => {
        if (editingId) {
          const inDept = dept.members.some((m) => m.id === editingId);
          if (dept.id === staffForm.departmentId) {
            const without = dept.members.filter((m) => m.id !== editingId);
            return { ...dept, members: [...without, entry] };
          }
          if (inDept) {
            return {
              ...dept,
              members: dept.members.filter((m) => m.id !== editingId),
            };
          }
          return dept;
        }

        if (dept.id !== staffForm.departmentId) return dept;
        return { ...dept, members: [...dept.members, entry] };
      })
    );
    resetForms();
  }

  function deleteStaff(id) {
    if (!window.confirm("Remove this staff member?")) return;
    setStaffDepartments((prev) =>
      prev.map((dept) => ({
        ...dept,
        members: dept.members.filter((m) => m.id !== id),
      }))
    );
    if (editingId === id) resetForms();
  }

  /* ─── Partners ─── */

  function editPartner(p, groupId) {
    setTab("partners");
    setEditingId(p.id);
    setPartnerForm({
      groupId,
      name: p.name || "",
      role: p.role || "",
      description: p.description || "",
      website: p.website || "",
      logo: p.logo || "",
      accent: p.accent || "#ff7a00",
      tags: (p.tags || []).join(", "),
    });
  }

  function upsertPartner(e) {
    e.preventDefault();
    if (!partnerForm.name.trim() || !partnerForm.groupId) return;

    const accent = partnerForm.accent || "#ff7a00";
    const allPartners = partnerGroups.flatMap((g) => g.partners);
    const existing = allPartners.find((p) => p.id === editingId);
    const entry = {
      id: editingId || slugify(partnerForm.name) || crypto.randomUUID(),
      name: partnerForm.name.trim(),
      role: partnerForm.role.trim() || "Official Partner",
      description: partnerForm.description.trim(),
      website: partnerForm.website.trim(),
      logo: partnerForm.logo.trim(),
      accent,
      accentRgb: hexToRgb(accent),
      tags: parseTags(partnerForm.tags),
      number: existing?.number || nextNumber(allPartners),
    };

    setPartnerGroups((prev) =>
      prev.map((group) => {
        if (editingId) {
          const inGroup = group.partners.some((p) => p.id === editingId);
          if (group.id === partnerForm.groupId) {
            const without = group.partners.filter((p) => p.id !== editingId);
            return { ...group, partners: [...without, entry] };
          }
          if (inGroup) {
            return {
              ...group,
              partners: group.partners.filter((p) => p.id !== editingId),
            };
          }
          return group;
        }

        if (group.id !== partnerForm.groupId) return group;
        return { ...group, partners: [...group.partners, entry] };
      })
    );
    resetForms();
  }

  function deletePartner(id) {
    if (!window.confirm("Remove this partner?")) return;
    setPartnerGroups((prev) =>
      prev.map((group) => ({
        ...group,
        partners: group.partners.filter((p) => p.id !== id),
      }))
    );
    if (editingId === id) resetForms();
  }

  if (loading) {
    return <div className="adminCardWide muted">Loading content manager…</div>;
  }

  return (
    <section className="adminSection">
      <div className="adminContentHead">
        <div>
          <h2 className="adminSectionTitle">Content Manager</h2>
          <p className="muted">
            Add or update creators, staff, and partners without touching code.
            Upload a photo with the button below, or paste an existing path/URL.
          </p>
        </div>
        <div className="adminContentActions">
          <button type="button" className="btnGhost" onClick={handleResetDefaults}>
            Reload defaults
          </button>
          <motion.button
            type="button"
            className="btnPrimary"
            onClick={handleSave}
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {saving ? "Saving…" : "Publish changes"}
          </motion.button>
        </div>
      </div>

      {message && <div className="adminNotice ok">{message}</div>}
      {error && <div className="adminNotice error">{error}</div>}
      {isDirty && (
        <div className="adminNotice warn">
          You have unpublished changes. Click <strong>Publish changes</strong>{" "}
          to update the live site.
        </div>
      )}

      <div className="adminTabRow">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`adminChip ${tab === t.id ? "active" : ""}`}
            onClick={() => {
              setTab(t.id);
              resetForms();
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="adminContentLayout">
        <div className="adminCardWide adminContentList">
          {tab === "creators" && (
            <>
              <div className="adminCardTitle">Creators ({creators.length})</div>
              <div className="adminContentItems">
                {creators.map((c) => (
                  <div key={c.id} className="adminContentItem">
                    <div>
                      <div className="adminContentItemTitle">{c.name}</div>
                      <div className="muted small">
                        {c.game} · {c.twitchLogin}
                      </div>
                    </div>
                    <div className="adminContentItemActions">
                      <button type="button" className="btnGhost" onClick={() => editCreator(c)}>
                        Edit
                      </button>
                      <button type="button" className="btnGhost danger" onClick={() => deleteCreator(c.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "staff" && (
            <>
              <div className="adminCardTitle">Staff</div>
              {staffDepartments.map((dept) => (
                <div key={dept.id} className="adminContentGroup">
                  <div className="adminContentGroupTitle">
                    {dept.icon} {dept.label}
                  </div>
                  {dept.members.length === 0 ? (
                    <div className="muted small">No members in this department.</div>
                  ) : (
                    dept.members.map((m) => (
                      <div key={m.id} className="adminContentItem">
                        <div>
                          <div className="adminContentItemTitle">{m.name}</div>
                          <div className="muted small">{m.role}</div>
                        </div>
                        <div className="adminContentItemActions">
                          <button
                            type="button"
                            className="btnGhost"
                            onClick={() => editStaffMember(m, dept.id)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btnGhost danger"
                            onClick={() => deleteStaff(m.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ))}
            </>
          )}

          {tab === "partners" && (
            <>
              <div className="adminCardTitle">Partners</div>
              {partnerGroups.map((group) => (
                <div key={group.id} className="adminContentGroup">
                  <div className="adminContentGroupTitle">
                    {group.icon} {group.label}
                  </div>
                  {group.partners.length === 0 ? (
                    <div className="muted small">No partners in this group yet.</div>
                  ) : (
                    group.partners.map((p) => (
                      <div key={p.id} className="adminContentItem">
                        <div>
                          <div className="adminContentItemTitle">{p.name}</div>
                          <div className="muted small">{p.role}</div>
                        </div>
                        <div className="adminContentItemActions">
                          <button
                            type="button"
                            className="btnGhost"
                            onClick={() => editPartner(p, group.id)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btnGhost danger"
                            onClick={() => deletePartner(p.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        <div className="adminCardWide adminContentForm">
          <div className="adminCardTitle">
            {editingId ? "Edit entry" : "Add new entry"}
          </div>

          {tab === "creators" && (
            <form className="adminFormGrid" onSubmit={upsertCreator}>
              <Field label="Name *">
                <input className="input" value={creatorForm.name} onChange={(e) => setCreatorForm((f) => ({ ...f, name: e.target.value }))} required />
              </Field>
              <Field label="Handle">
                <input className="input" value={creatorForm.handle} onChange={(e) => setCreatorForm((f) => ({ ...f, handle: e.target.value }))} placeholder="@name" />
              </Field>
              <Field label="Role">
                <input className="input" value={creatorForm.role} onChange={(e) => setCreatorForm((f) => ({ ...f, role: e.target.value }))} />
              </Field>
              <Field label="Game / focus">
                <input className="input" value={creatorForm.game} onChange={(e) => setCreatorForm((f) => ({ ...f, game: e.target.value }))} />
              </Field>
              <Field label="Twitch URL">
                <input className="input" value={creatorForm.twitch} onChange={(e) => setCreatorForm((f) => ({ ...f, twitch: e.target.value }))} placeholder="https://www.twitch.tv/username" />
              </Field>
              <Field label="Twitch login">
                <input className="input" value={creatorForm.twitchLogin} onChange={(e) => setCreatorForm((f) => ({ ...f, twitchLogin: e.target.value }))} placeholder="username" />
              </Field>
              <ImageUploadField
                label="Photo"
                value={creatorForm.image}
                onChange={(image) => setCreatorForm((f) => ({ ...f, image }))}
                folder="creators"
                slug={creatorForm.name}
                hint="PNG/JPG/WebP, max 5 MB. Upload fills the path automatically."
                placeholder="/creators/name.png or https://..."
              />
              <Field label="Instagram URL">
                <input className="input" value={creatorForm.instagram} onChange={(e) => setCreatorForm((f) => ({ ...f, instagram: e.target.value }))} />
              </Field>
              <Field label="X / Twitter URL">
                <input className="input" value={creatorForm.twitter} onChange={(e) => setCreatorForm((f) => ({ ...f, twitter: e.target.value }))} />
              </Field>
              <Field label="Accent color">
                <input className="input" type="color" value={creatorForm.accent} onChange={(e) => setCreatorForm((f) => ({ ...f, accent: e.target.value }))} />
              </Field>
              <Field label="Tags" hint="Comma-separated">
                <input className="input" value={creatorForm.tags} onChange={(e) => setCreatorForm((f) => ({ ...f, tags: e.target.value }))} />
              </Field>
              <div className="adminFormActions">
                <button type="submit" className="btnPrimary">
                  {editingId ? "Update creator" : "Add creator"}
                </button>
                {editingId && (
                  <button type="button" className="btnGhost" onClick={resetForms}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}

          {tab === "staff" && (
            <form className="adminFormGrid" onSubmit={upsertStaff}>
              <Field label="Department *">
                <select
                  className="input"
                  value={staffForm.departmentId}
                  onChange={(e) => setStaffForm((f) => ({ ...f, departmentId: e.target.value }))}
                >
                  {departmentOptions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Name *">
                <input className="input" value={staffForm.name} onChange={(e) => setStaffForm((f) => ({ ...f, name: e.target.value }))} required />
              </Field>
              <Field label="Role *">
                <input className="input" value={staffForm.role} onChange={(e) => setStaffForm((f) => ({ ...f, role: e.target.value }))} required />
              </Field>
              <Field label="Game / area">
                <input className="input" value={staffForm.game} onChange={(e) => setStaffForm((f) => ({ ...f, game: e.target.value }))} />
              </Field>
              <ImageUploadField
                label="Photo"
                value={staffForm.image}
                onChange={(image) => setStaffForm((f) => ({ ...f, image }))}
                folder="staff"
                slug={staffForm.name}
                hint="PNG/JPG/WebP, max 5 MB."
                placeholder="/staff/name.png or https://..."
              />
              <Field label="Initials">
                <input className="input" value={staffForm.initials} onChange={(e) => setStaffForm((f) => ({ ...f, initials: e.target.value }))} placeholder="AB" />
              </Field>
              <Field label="Accent color">
                <input className="input" type="color" value={staffForm.accent} onChange={(e) => setStaffForm((f) => ({ ...f, accent: e.target.value }))} />
              </Field>
              <Field label="Tags" hint="Comma-separated">
                <input className="input" value={staffForm.tags} onChange={(e) => setStaffForm((f) => ({ ...f, tags: e.target.value }))} />
              </Field>
              <div className="adminFormActions">
                <button type="submit" className="btnPrimary">
                  {editingId ? "Update staff" : "Add staff"}
                </button>
                {editingId && (
                  <button type="button" className="btnGhost" onClick={resetForms}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}

          {tab === "partners" && (
            <form className="adminFormGrid" onSubmit={upsertPartner}>
              <Field label="Group *">
                <select
                  className="input"
                  value={partnerForm.groupId}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, groupId: e.target.value }))}
                >
                  {partnerGroupOptions.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Name *">
                <input className="input" value={partnerForm.name} onChange={(e) => setPartnerForm((f) => ({ ...f, name: e.target.value }))} required />
              </Field>
              <Field label="Role">
                <input className="input" value={partnerForm.role} onChange={(e) => setPartnerForm((f) => ({ ...f, role: e.target.value }))} />
              </Field>
              <Field label="Description">
                <textarea className="input" rows={3} value={partnerForm.description} onChange={(e) => setPartnerForm((f) => ({ ...f, description: e.target.value }))} />
              </Field>
              <Field label="Website URL">
                <input className="input" value={partnerForm.website} onChange={(e) => setPartnerForm((f) => ({ ...f, website: e.target.value }))} />
              </Field>
              <ImageUploadField
                label="Logo"
                value={partnerForm.logo}
                onChange={(logo) => setPartnerForm((f) => ({ ...f, logo }))}
                folder="partners"
                slug={partnerForm.name}
                hint="PNG/JPG/WebP, max 5 MB."
                placeholder="/partners/logo.webp or https://..."
              />
              <Field label="Accent color">
                <input className="input" type="color" value={partnerForm.accent} onChange={(e) => setPartnerForm((f) => ({ ...f, accent: e.target.value }))} />
              </Field>
              <Field label="Tags" hint="Comma-separated">
                <input className="input" value={partnerForm.tags} onChange={(e) => setPartnerForm((f) => ({ ...f, tags: e.target.value }))} />
              </Field>
              <div className="adminFormActions">
                <button type="submit" className="btnPrimary">
                  {editingId ? "Update partner" : "Add partner"}
                </button>
                {editingId && (
                  <button type="button" className="btnGhost" onClick={resetForms}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
