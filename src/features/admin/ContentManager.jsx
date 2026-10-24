import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../auth/useAuth.js";
import {
  fetchSiteContent,
  invalidateSiteContentCache,
  saveSiteContent,
} from "../../content/siteContent.js";
import {
  DEFAULT_MATCHES,
  fromLocalInputValue,
  toLocalInputValue,
} from "../../content/matches.js";
import {
  hexToRgb,
  nextNumber,
  parseTags,
  parseTwitchLogin,
  slugify,
} from "../../lib/contentHelpers.js";
import ImageUploadField from "./ImageUploadField.jsx";
import Alert from "../../components/ui/Alert.jsx";
import Field from "../../components/ui/Field.jsx";

const TABS = [
  { id: "matches", label: "Matches" },
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
  accent: "#ff6a00",
  tags: "Entertainment, Community",
};

const EMPTY_STAFF = {
  departmentId: "",
  name: "",
  role: "",
  game: "",
  image: "",
  initials: "",
  accent: "#ff6a00",
  tags: "",
};

const EMPTY_PARTNER = {
  groupId: "",
  name: "",
  role: "Official Partner",
  description: "",
  website: "",
  logo: "",
  accent: "#ff6a00",
  tags: "",
};

function snapshotContent(creators, staffDepartments, partnerGroups, matches) {
  return JSON.stringify({ creators, staffDepartments, partnerGroups, matches });
}

function normalizeMatchesDraft(matches) {
  const base = matches || DEFAULT_MATCHES;
  return {
    matchTwitchUrl: base.matchTwitchUrl || DEFAULT_MATCHES.matchTwitchUrl,
    lastMatch: { ...DEFAULT_MATCHES.lastMatch, ...(base.lastMatch || {}) },
    nextMatch: { ...DEFAULT_MATCHES.nextMatch, ...(base.nextMatch || {}) },
  };
}

export default function AdminContentManager() {
  const { user } = useAuth();
  const [tab, setTab] = useState("matches");
  const [creators, setCreators] = useState([]);
  const [staffDepartments, setStaffDepartments] = useState([]);
  const [partnerGroups, setPartnerGroups] = useState([]);
  const [matches, setMatches] = useState(() => normalizeMatchesDraft(null));
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
      const nextMatches = normalizeMatchesDraft(content.matches);
      setCreators(content.creators);
      setStaffDepartments(content.staffDepartments);
      setPartnerGroups(content.partnerGroups);
      setMatches(nextMatches);
      setStaffForm((f) => ({
        ...f,
        departmentId: f.departmentId || content.staffDepartments[0]?.id || "",
      }));
      setPartnerForm((f) => ({
        ...f,
        groupId: f.groupId || content.partnerGroups[0]?.id || "",
      }));
      setSavedSnapshot(
        snapshotContent(
          content.creators,
          content.staffDepartments,
          content.partnerGroups,
          nextMatches
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
      snapshotContent(creators, staffDepartments, partnerGroups, matches) !==
      savedSnapshot
    );
  }, [creators, staffDepartments, partnerGroups, matches, savedSnapshot]);

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

  async function handleSave() {
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const token = await user?.firebaseUser?.getIdToken?.();
      if (!token) throw new Error("You must be logged in to save.");

      const matchesPayload = {
        matchTwitchUrl: (matches.matchTwitchUrl || "").trim(),
        lastMatch: {
          ...matches.lastMatch,
          opponentLogo: (matches.lastMatch.opponentLogo || "").trim(),
          vodUrl: (matches.lastMatch.vodUrl || "").trim(),
        },
        nextMatch: {
          ...matches.nextMatch,
          date: matches.nextMatch.date || null,
          opponent: (matches.nextMatch.opponent || "").trim(),
          opponentTag: (matches.nextMatch.opponentTag || "").trim(),
          opponentLogo: (matches.nextMatch.opponentLogo || "").trim(),
        },
      };

      await saveSiteContent(
        { creators, staffDepartments, partnerGroups, matches: matchesPayload },
        token
      );
      const publishedMatches = normalizeMatchesDraft(matchesPayload);
      setMatches(publishedMatches);
      setSavedSnapshot(
        snapshotContent(
          creators,
          staffDepartments,
          partnerGroups,
          publishedMatches
        )
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
    if (!window.confirm("Reload the latest published content into the editor? Unpublished drafts will be lost.")) {
      return;
    }
    invalidateSiteContentCache();
    fetchSiteContent({ force: true }).then((content) => {
      const nextMatches = normalizeMatchesDraft(content.matches);
      setCreators(content.creators);
      setStaffDepartments(content.staffDepartments);
      setPartnerGroups(content.partnerGroups);
      setMatches(nextMatches);
      setSavedSnapshot(
        snapshotContent(
          content.creators,
          content.staffDepartments,
          content.partnerGroups,
          nextMatches
        )
      );
      resetForms();
      setMessage("Reloaded published content into the editor.");
    });
  }

  function patchLastMatch(patch) {
    setMatches((m) => ({
      ...m,
      lastMatch: { ...m.lastMatch, ...patch },
    }));
  }

  function patchNextMatch(patch) {
    setMatches((m) => ({
      ...m,
      nextMatch: { ...m.nextMatch, ...patch },
    }));
  }

  function clearNextMatch() {
    setMatches((m) => ({
      ...m,
      nextMatch: {
        competition: "LPLOL",
        format: "Best of 1",
        date: null,
        opponent: "",
        opponentTag: "",
        opponentLogo: "",
      },
    }));
    setMessage("Next match cleared in draft. Publish to update the homepage.");
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
      accent: c.accent || "#ff6a00",
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
    const accent = creatorForm.accent || "#ff6a00";
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
      accent: member.accent || "#ff6a00",
      tags: (member.tags || []).join(", "),
    });
  }

  function upsertStaff(e) {
    e.preventDefault();
    if (!staffForm.name.trim() || !staffForm.departmentId) return;

    const accent = staffForm.accent || "#ff6a00";
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
      accent: p.accent || "#ff6a00",
      tags: (p.tags || []).join(", "),
    });
  }

  function upsertPartner(e) {
    e.preventDefault();
    if (!partnerForm.name.trim() || !partnerForm.groupId) return;

    const accent = partnerForm.accent || "#ff6a00";
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
    return <div className="panel muted">Loading content manager…</div>;
  }

  return (
    <section className="admin">
      <div className="admin__head">
        <span className={`mono ${isDirty ? "text-orange" : "faint"}`}>
          {isDirty ? "● Unpublished changes" : "All changes published"}
        </span>
        <div className="row">
          <button type="button" className="btn btn--ghost btn--sm" onClick={handleResetDefaults}>
            Reload published
          </button>
          <motion.button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={handleSave}
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {saving ? "Saving…" : "Publish changes"}
          </motion.button>
        </div>
      </div>

      {message && (
        <Alert tone="ok" onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert tone="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {isDirty && (
        <Alert tone="warn">
          You have unpublished changes. Click <strong>Publish changes</strong> to update the live site.
        </Alert>
      )}

      <div className="chip-row admin__tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`chip ${tab === t.id ? "is-active" : ""}`}
            onClick={() => {
              setTab(t.id);
              resetForms();
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={`admin__layout ${tab === "matches" ? "admin__layout--single" : ""}`}>
        {tab !== "matches" && (
        <div className="panel admin__list">
          {tab === "creators" && (
            <>
              <div className="panel__title">Creators ({creators.length})</div>
              <div className="admin__items">
                {creators.map((c) => (
                  <div key={c.id} className="admin__item">
                    <div>
                      <div className="admin__item-title">{c.name}</div>
                      <div className="faint small">
                        {c.game} · {c.twitchLogin}
                      </div>
                    </div>
                    <div className="row">
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => editCreator(c)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn--danger btn--sm" onClick={() => deleteCreator(c.id)}>
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
              <div className="panel__title">Staff</div>
              {staffDepartments.map((dept) => (
                <div key={dept.id} className="admin__group">
                  <div className="mono faint admin__group-title">
                    {dept.icon} {dept.label}
                  </div>
                  {dept.members.length === 0 ? (
                    <div className="faint small">No members in this department.</div>
                  ) : (
                    dept.members.map((m) => (
                      <div key={m.id} className="admin__item">
                        <div>
                          <div className="admin__item-title">{m.name}</div>
                          <div className="faint small">{m.role}</div>
                        </div>
                        <div className="row">
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => editStaffMember(m, dept.id)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn--danger btn--sm"
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
              <div className="panel__title">Partners</div>
              {partnerGroups.map((group) => (
                <div key={group.id} className="admin__group">
                  <div className="mono faint admin__group-title">
                    {group.icon} {group.label}
                  </div>
                  {group.partners.length === 0 ? (
                    <div className="faint small">No partners in this group yet.</div>
                  ) : (
                    group.partners.map((p) => (
                      <div key={p.id} className="admin__item">
                        <div>
                          <div className="admin__item-title">{p.name}</div>
                          <div className="faint small">{p.role}</div>
                        </div>
                        <div className="row">
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => editPartner(p, group.id)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn--danger btn--sm"
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
        )}

        <div className="panel admin__form">
          {tab !== "matches" && (
          <div className="panel__title">
            {editingId ? "Edit entry" : "Add new entry"}
          </div>
          )}

          {tab === "matches" && (
            <div className="form-grid">
              <div className="panel__title span-2">
                Match Center
              </div>
              <p className="muted small span-2">
                Edit last result and next match. Leave next opponent/date empty for TBA.
                Changes apply after you click Publish changes.
              </p>

              <Field label="Match Twitch URL">
                <input
                  className="input"
                  value={matches.matchTwitchUrl}
                  onChange={(e) =>
                    setMatches((m) => ({ ...m, matchTwitchUrl: e.target.value }))
                  }
                  placeholder="https://www.twitch.tv/..."
                />
              </Field>

              <div className="admin__divider span-2">
                Last result
              </div>

              <Field label="League">
                <input
                  className="input"
                  value={matches.lastMatch.league || ""}
                  onChange={(e) => patchLastMatch({ league: e.target.value })}
                />
              </Field>
              <Field label="Competition label">
                <input
                  className="input"
                  value={matches.lastMatch.competition || ""}
                  onChange={(e) => patchLastMatch({ competition: e.target.value })}
                  placeholder="Season Opener · Game 1"
                />
              </Field>
              <Field label="Result">
                <select
                  className="input"
                  value={matches.lastMatch.result || "W"}
                  onChange={(e) => patchLastMatch({ result: e.target.value })}
                >
                  <option value="W">Win (W)</option>
                  <option value="L">Loss (L)</option>
                </select>
              </Field>
              <Field label="Score">
                <input
                  className="input"
                  value={matches.lastMatch.score || ""}
                  onChange={(e) => patchLastMatch({ score: e.target.value })}
                  placeholder="1-0"
                />
              </Field>
              <Field label="Opponent name">
                <input
                  className="input"
                  value={matches.lastMatch.opponent || ""}
                  onChange={(e) => patchLastMatch({ opponent: e.target.value })}
                />
              </Field>
              <Field label="Opponent tag">
                <input
                  className="input"
                  value={matches.lastMatch.opponentTag || ""}
                  onChange={(e) => patchLastMatch({ opponentTag: e.target.value })}
                  placeholder="ZZG"
                />
              </Field>
              <Field label="Opponent logo path" hint="Optional, e.g. /opponents/team.png">
                <input
                  className="input"
                  value={matches.lastMatch.opponentLogo || ""}
                  onChange={(e) => patchLastMatch({ opponentLogo: e.target.value })}
                />
              </Field>
              <Field label="VOD / recap URL" hint="Optional">
                <input
                  className="input"
                  value={matches.lastMatch.vodUrl || ""}
                  onChange={(e) => patchLastMatch({ vodUrl: e.target.value })}
                />
              </Field>

              <div className="admin__divider span-2">
                Next match
              </div>

              <Field label="Competition">
                <input
                  className="input"
                  value={matches.nextMatch.competition || ""}
                  onChange={(e) => patchNextMatch({ competition: e.target.value })}
                />
              </Field>
              <Field label="Format">
                <select
                  className="input"
                  value={matches.nextMatch.format || "Best of 1"}
                  onChange={(e) => patchNextMatch({ format: e.target.value })}
                >
                  <option value="Best of 1">Best of 1</option>
                  <option value="Best of 3">Best of 3</option>
                  <option value="Best of 5">Best of 5</option>
                </select>
              </Field>
              <Field label="Date & time" hint="Local time. Clear to show TBA.">
                <input
                  className="input"
                  type="datetime-local"
                  value={toLocalInputValue(matches.nextMatch.date)}
                  onChange={(e) =>
                    patchNextMatch({ date: fromLocalInputValue(e.target.value) })
                  }
                />
              </Field>
              <Field label="Opponent name">
                <input
                  className="input"
                  value={matches.nextMatch.opponent || ""}
                  onChange={(e) => patchNextMatch({ opponent: e.target.value })}
                  placeholder="Leave empty for TBA"
                />
              </Field>
              <Field label="Opponent tag">
                <input
                  className="input"
                  value={matches.nextMatch.opponentTag || ""}
                  onChange={(e) => patchNextMatch({ opponentTag: e.target.value })}
                  placeholder="NGE"
                />
              </Field>
              <Field label="Opponent logo path" hint="Optional, e.g. /opponents/team.png">
                <input
                  className="input"
                  value={matches.nextMatch.opponentLogo || ""}
                  onChange={(e) => patchNextMatch({ opponentLogo: e.target.value })}
                />
              </Field>

              <div className="row span-2">
                <button type="button" className="btn btn--ghost btn--sm" onClick={clearNextMatch}>
                  Clear next match (TBA)
                </button>
              </div>

              <div className="admin__preview mono span-2">
                Preview: Last {matches.lastMatch.result} {matches.lastMatch.score} vs{" "}
                {matches.lastMatch.opponentTag || matches.lastMatch.opponent || "—"}
                {" · "}
                Next{" "}
                {matches.nextMatch.opponentTag || matches.nextMatch.opponent || "TBA"}
                {matches.nextMatch.date
                  ? ` · ${new Date(matches.nextMatch.date).toLocaleString()}`
                  : " · date TBA"}
              </div>
            </div>
          )}

          {tab === "creators" && (
            <form className="form-grid" onSubmit={upsertCreator}>
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
              <div className="row span-2">
                <button type="submit" className="btn btn--primary btn--sm">
                  {editingId ? "Update creator" : "Add creator"}
                </button>
                {editingId && (
                  <button type="button" className="btn btn--ghost btn--sm" onClick={resetForms}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}

          {tab === "staff" && (
            <form className="form-grid" onSubmit={upsertStaff}>
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
              <div className="row span-2">
                <button type="submit" className="btn btn--primary btn--sm">
                  {editingId ? "Update staff" : "Add staff"}
                </button>
                {editingId && (
                  <button type="button" className="btn btn--ghost btn--sm" onClick={resetForms}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}

          {tab === "partners" && (
            <form className="form-grid" onSubmit={upsertPartner}>
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
              <div className="row span-2">
                <button type="submit" className="btn btn--primary btn--sm">
                  {editingId ? "Update partner" : "Add partner"}
                </button>
                {editingId && (
                  <button type="button" className="btn btn--ghost btn--sm" onClick={resetForms}>
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
