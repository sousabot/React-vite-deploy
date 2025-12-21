export async function handler(event) {
  const data = new URLSearchParams(event.body);

  const payload = {
    embeds: [
      {
        title: "📝 New GD Esports Application",
        color: 9145343,
        fields: [
          { name: "Name", value: `${data.get("firstName")} ${data.get("lastName")}`, inline: true },
          { name: "Age", value: data.get("age"), inline: true },
          { name: "Discord", value: data.get("discord") },
          { name: "About", value: data.get("about") || "—" },
          { name: "Tournaments", value: data.get("tournaments") || "—" },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };

  await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return { statusCode: 200, body: "OK" };
}
