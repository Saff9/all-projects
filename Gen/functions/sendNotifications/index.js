const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

admin.initializeApp();
const db = admin.firestore();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Triggered when a notification doc is created
exports.onNotificationCreated = functions.firestore
  .document('notifications/{nid}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    if (!data) return null;

    const message = data.message || 'New content';
    const postId = data.postId;

    // Load subscribers (emails)
    const subsSnap = await db.collection('subscribers').get();
    const emails = [];
    subsSnap.forEach(doc => {
      const d = doc.data();
      if (d && d.email) emails.push(d.email);
    });

    if (emails.length === 0) {
      console.log('No subscribers to notify');
      return null;
    }

    // Break into batches (SendGrid has limits)
    const batches = [];
    const BATCH_SIZE = 1000;
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      batches.push(emails.slice(i, i + BATCH_SIZE));
    }

    const promises = batches.map(batch => {
      const msg = {
        to: batch,
        from: 'no-reply@yourdomain.com', // must be verified sender
        subject: 'New post on Apex Smart',
        text: message + (postId ? `\n\nRead: https://saff9.github.io/ApexSmart-/blog.html#post-${postId}` : ''),
        html: `<p>${message}</p><p><a href="https://saff9.github.io/ApexSmart-/blog.html#post-${postId}">Read on Apex Smart</a></p>`
      };
      return sgMail.send(msg);
    });

    try {
      await Promise.all(promises);
      console.log('Notifications sent to', emails.length);
      // optionally mark notification as sent
      await snap.ref.update({ sentAt: admin.firestore.FieldValue.serverTimestamp(), sentCount: emails.length });
    } catch (e) {
      console.error('Failed to send notifications', e);
    }

    return null;
});
