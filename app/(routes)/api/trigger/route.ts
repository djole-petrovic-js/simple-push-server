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

  // const payload = JSON.stringify({
  //   title: "New Notification",
  //   body: "This is a push notification from the Node.js server",
  //   icon: "https://cruel-cats.surge.sh/icon.png",
  //   badge: "https://cruel-cats.surge.sh/icon.png",
  //   url: "https://google.com",
  //   // url: "https://localhost:5173/",
  // });

  // const payload = JSON.stringify({
  //   web_push: 8030,
  //   notification: {
  //     title: "Evo velike slike!",
  //     body: "Klikni i drži (long press) da vidiš sliku.",
  //     image: "https://cruel-cats.surge.sh/hero_image.jpg",
  //     icon: "https://cruel-cats.surge.sh/icon.png",
  //     click_url: "https://google.com",
  //     actions: [
  //       {
  //         action: "open",
  //         title: "Otvori odmah",
  //       },
  //     ],
  //   },
  // });

  const payload = JSON.stringify({
    web_push: 8030,
    notification: {
      title: "Slika radi!",
      body: "Pritisni jako na mene da me vidiš!",
      // image: "https://cruel-cats.surge.sh/hero_image.jpg",
      image: "https://cruel-cats.surge.sh/hero_image_1024_512.jpg",
      icon: "https://cruel-cats.surge.sh/icon.png",
      navigate: "https://cruel-cats.surge.sh/demo.html", // OBAVEZNO: 'navigate', ne 'url'
    },
  });

  for (const key of Object.keys(pushRecords)) {
    try {
      await webpush.sendNotification(
        pushRecords[key].subscription.subscription.browserSubscription,
        payload,
        {
          headers: {
            "Content-Type": "application/notification+json", // OVO JE KLJUČNO
          },
        }
      );

      responseData.push({
        userId: pushRecords[key].subscription.subscription.userId,
        success: true,
      });
    } catch (err) {
      console.log("error", err);

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
