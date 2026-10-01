// Netlify runs this automatically after every verified (non-spam) form submission.
// It creates one item on the 9 Arrow Monday leads board per lead. Two forms feed it:
//   estimate-start    the email captured by the "Get an estimate" pull-out (a lead even if they stop there)
//   estimate-request  the full 4-step form that follows
//
// Netlify environment variables (Site settings > Environment variables):
//   MONDAY_API_TOKEN   Personal API token from Monday (Profile > Developers > My access tokens)
//   MONDAY_BOARD_ID    Numeric board ID from the board URL (monday.com/boards/<ID>)
//   MONDAY_GROUP_ID    Optional. Group to drop new leads into, e.g. "new_group" or "topics"
//   MONDAY_START_GROUP_ID  Optional. Separate group for email-only starts (defaults to MONDAY_GROUP_ID)
//   MONDAY_COLUMNS     Optional JSON mapping form fields to Monday columns, e.g.
//     {"email":{"id":"email","type":"email"},"phone":{"id":"phone","type":"phone"},
//      "services":{"id":"dropdown","type":"dropdown"},"acreage":{"id":"status","type":"status"},
//      "property_location":{"id":"text","type":"text"},"notes":{"id":"long_text","type":"long_text"},
//      "utm_source":{"id":"text8","type":"text"}}
//
// Every submission is also posted as an update on the item with all fields, so nothing is lost
// even before the column mapping is finished.

const API = "https://api.monday.com/v2";

const LABELS = {
  name: "Name", phone: "Phone", email: "Email", contact_preference: "Best way to reach",
  services: "Services", acreage: "Acreage", property_location: "Property location",
  client_type: "Client type", timeline: "Timeline", notes: "Notes",
  need: "Started from", page_variant: "Page", landing_page: "Landing page", referrer: "Referrer",
  utm_source: "utm_source", utm_medium: "utm_medium", utm_campaign: "utm_campaign",
  utm_term: "utm_term", utm_content: "utm_content", gclid: "gclid", fbclid: "fbclid",
};

function columnValue(type, value) {
  if (!value) return null;
  switch (type) {
    case "email": return { email: value, text: value };
    case "phone": return { phone: String(value).replace(/[^\d+]/g, ""), countryShortName: "US" };
    case "long_text": return { text: value };
    case "status": return { label: value };
    case "dropdown": return { labels: String(value).split(",").map((s) => s.trim()).filter(Boolean) };
    case "date": return { date: String(value).slice(0, 10) };
    default: return String(value);
  }
}

async function monday(query, variables) {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: process.env.MONDAY_API_TOKEN,
      "API-Version": "2024-10",
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors || json.error_message) {
    throw new Error("Monday API error: " + JSON.stringify(json.errors || json.error_message || json));
  }
  return json.data;
}

exports.handler = async (event) => {
  const { payload } = JSON.parse(event.body || "{}");
  const FORMS = ["estimate-request", "estimate-start"];
  if (!payload || !FORMS.includes(payload.form_name)) return { statusCode: 200, body: "ignored" };
  const isStart = payload.form_name === "estimate-start";
  if (!process.env.MONDAY_API_TOKEN || !process.env.MONDAY_BOARD_ID) {
    console.error("MONDAY_API_TOKEN or MONDAY_BOARD_ID is not set; lead kept in Netlify Forms only.");
    return { statusCode: 200, body: "monday not configured" };
  }

  const d = payload.data || {};
  const map = process.env.MONDAY_COLUMNS ? JSON.parse(process.env.MONDAY_COLUMNS) : {};
  const columns = {};
  for (const [field, col] of Object.entries(map)) {
    const v = columnValue(col.type, d[field]);
    if (v !== null) columns[col.id] = v;
  }

  const itemName = isStart
    ? "Email lead: " + (d.email || "unknown")
    : [d.name, d.property_location].filter(Boolean).join(" · ") || "Website estimate request";
  const group = (isStart && process.env.MONDAY_START_GROUP_ID) || process.env.MONDAY_GROUP_ID || null;

  const created = await monday(
    `mutation ($board: ID!, $group: String, $name: String!, $cols: JSON) {
       create_item(board_id: $board, group_id: $group, item_name: $name, column_values: $cols, create_labels_if_missing: true) { id }
     }`,
    { board: String(process.env.MONDAY_BOARD_ID), group, name: itemName, cols: JSON.stringify(columns) }
  );

  const lines = Object.keys(LABELS)
    .filter((k) => d[k])
    .map((k) => `<b>${LABELS[k]}:</b> ${String(d[k]).replace(/</g, "&lt;")}`);
  lines.unshift(`<b>Form:</b> ${isStart ? "Estimate pull-out (email only so far)" : "Full estimate request"}`);
  lines.push(`<b>Submitted:</b> ${payload.created_at || new Date().toISOString()}`);

  await monday(
    `mutation ($item: ID!, $body: String!) { create_update(item_id: $item, body: $body) { id } }`,
    { item: created.create_item.id, body: lines.join("<br>") }
  );

  return { statusCode: 200, body: "ok" };
};
