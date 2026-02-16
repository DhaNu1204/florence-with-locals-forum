const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://forum.florencewithlocals.com";

function emailWrapper(content: string, preheader: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Florence With Locals Forum</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#F5F0E8;font-family:Inter,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>
  <!-- Outer wrapper -->
  <div style="width:100%;background-color:#F5F0E8;padding:24px 16px;">
    <div style="max-width:600px;width:100%;margin:0 auto;">
      <!-- Header -->
      <div style="background-color:#5D4037;border-radius:8px 8px 0 0;padding:24px;text-align:center;">
        <a href="${SITE_URL}" style="color:#FFF8E7;font-size:22px;font-weight:bold;text-decoration:none;font-family:Georgia,'Playfair Display',serif;">
          Florence With Locals
        </a>
      </div>
      <!-- Body -->
      <div style="background-color:#FFF8E7;padding:32px 24px;">
        ${content}
      </div>
      <!-- Footer -->
      <div style="background-color:#5D4037;border-radius:0 0 8px 8px;padding:20px 24px;text-align:center;">
        <p style="margin:0;font-size:13px;color:#FFF8E7;opacity:0.8;">
          <a href="${SITE_URL}/settings" style="color:#FFF8E7;text-decoration:underline;">Manage email preferences</a>
          &nbsp;&middot;&nbsp;
          <a href="${SITE_URL}" style="color:#FFF8E7;text-decoration:underline;">Visit forum</a>
        </p>
        <p style="margin:8px 0 0;font-size:12px;color:#FFF8E7;opacity:0.6;">
          Florence With Locals Forum &middot; Florence, Italy
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function ctaButton(href: string, label: string): string {
  return `<div style="text-align:center;margin:24px 0;">
    <a href="${href}" style="display:inline-block;background-color:#C75B39;color:#FFF8E7;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">
      ${label}
    </a>
  </div>`;
}

export function replyNotificationEmail(params: {
  actorUsername: string;
  threadTitle: string;
  threadSlug: string;
  replyPreview: string;
}): { subject: string; html: string } {
  const subject = `${params.actorUsername} replied to "${params.threadTitle}"`;
  const threadUrl = `${SITE_URL}/t/${params.threadSlug}`;

  const content = `
    <h2 style="margin:0 0 16px;color:#2C2C2C;font-family:Georgia,'Playfair Display',serif;font-size:20px;">
      New reply to your thread
    </h2>
    <p style="margin:0 0 8px;color:#2C2C2C;font-size:15px;line-height:1.5;">
      <strong>${params.actorUsername}</strong> replied to <strong>${params.threadTitle}</strong>:
    </p>
    <div style="background-color:#F5F0E8;border-left:3px solid #C75B39;padding:12px 16px;margin:16px 0;border-radius:0 4px 4px 0;">
      <p style="margin:0;color:#2C2C2C;font-size:14px;line-height:1.5;">${params.replyPreview}</p>
    </div>
    ${ctaButton(threadUrl, "View Thread")}
  `;

  return { subject, html: emailWrapper(content, `${params.actorUsername} replied to your thread`) };
}

export function mentionNotificationEmail(params: {
  actorUsername: string;
  contentType: "thread" | "post";
  threadTitle: string;
  threadSlug: string;
  mentionPreview: string;
}): { subject: string; html: string } {
  const subject = `${params.actorUsername} mentioned you in "${params.threadTitle}"`;
  const threadUrl = `${SITE_URL}/t/${params.threadSlug}`;

  const content = `
    <h2 style="margin:0 0 16px;color:#2C2C2C;font-family:Georgia,'Playfair Display',serif;font-size:20px;">
      You were mentioned
    </h2>
    <p style="margin:0 0 8px;color:#2C2C2C;font-size:15px;line-height:1.5;">
      <strong>${params.actorUsername}</strong> mentioned you in a ${params.contentType}:
    </p>
    <div style="background-color:#F5F0E8;border-left:3px solid #C75B39;padding:12px 16px;margin:16px 0;border-radius:0 4px 4px 0;">
      <p style="margin:0;color:#2C2C2C;font-size:14px;line-height:1.5;">${params.mentionPreview}</p>
    </div>
    ${ctaButton(threadUrl, "View Thread")}
  `;

  return { subject, html: emailWrapper(content, `${params.actorUsername} mentioned you`) };
}

export function likeNotificationEmail(params: {
  actorUsername: string;
  contentType: "thread" | "post";
  threadTitle: string;
  threadSlug: string;
}): { subject: string; html: string } {
  const subject = `${params.actorUsername} liked your ${params.contentType}`;
  const threadUrl = `${SITE_URL}/t/${params.threadSlug}`;

  const content = `
    <h2 style="margin:0 0 16px;color:#2C2C2C;font-family:Georgia,'Playfair Display',serif;font-size:20px;">
      Someone liked your ${params.contentType}
    </h2>
    <p style="margin:0 0 8px;color:#2C2C2C;font-size:15px;line-height:1.5;">
      <strong>${params.actorUsername}</strong> liked your ${params.contentType} in <strong>${params.threadTitle}</strong>.
    </p>
    ${ctaButton(threadUrl, "View Thread")}
  `;

  return { subject, html: emailWrapper(content, `${params.actorUsername} liked your ${params.contentType}`) };
}

export function welcomeEmail(params: {
  username: string;
}): { subject: string; html: string } {
  const subject = "Welcome to Florence With Locals Forum!";

  const content = `
    <h2 style="margin:0 0 16px;color:#2C2C2C;font-family:Georgia,'Playfair Display',serif;font-size:20px;">
      Benvenuto, ${params.username}!
    </h2>
    <p style="margin:0 0 12px;color:#2C2C2C;font-size:15px;line-height:1.5;">
      Welcome to the Florence With Locals community — a place to share local tips,
      discover hidden gems, and connect with fellow Florence lovers.
    </p>
    <p style="margin:0 0 12px;color:#2C2C2C;font-size:15px;line-height:1.5;">
      Here are a few things you can do to get started:
    </p>
    <ul style="margin:0 0 16px;padding-left:20px;color:#2C2C2C;font-size:15px;line-height:1.8;">
      <li>Introduce yourself in the community</li>
      <li>Browse categories and join the conversation</li>
      <li>Share your favourite Florence photos</li>
    </ul>
    ${ctaButton(SITE_URL, "Explore the Forum")}
  `;

  return { subject, html: emailWrapper(content, "Welcome to Florence With Locals Forum!") };
}
