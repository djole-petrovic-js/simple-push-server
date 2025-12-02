import Kv from "@/app/lib/storage/kv";
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:djordje@orangeclickmedia.com",
  process.env.VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

export async function POST() {
  // Get all records (key-value pairs) starting with "push_"
  const pushRecords = await Kv.GetInstance().GetRecordsByPrefix(
    "push_subscriptions_1_"
  );

  const responseData = [];

  const payload = JSON.stringify({
    title: "New Notification",
    body: "This is a push notification from the Node.js server",
  });

  for (const key of Object.keys(pushRecords)) {
    try {
      await webpush.sendNotification(
        pushRecords[key].subscription.subscription.browserSubscription,
        payload
      );

      responseData.push({
        userId: pushRecords[key].subscription.subscription.userId,
        success: true,
      });
    } catch (err) {
      responseData.push({
        userId: pushRecords[key].subscription.subscription.userId,
        success: false,
        error: (err as Error).message,
      });
    }
  }

  return Response.json({
    success: true,
    responseData,
  });
}
