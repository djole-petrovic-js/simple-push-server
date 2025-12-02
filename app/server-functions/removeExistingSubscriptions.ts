"use server";

import Kv from "@/app/lib/storage/kv";

export default async function RemoveExistingSubscriptions() {
  const pushRecords = await Kv.GetInstance().GetRecordsByPrefix(
    "push_subscriptions_1_"
  );

  for (const key of Object.keys(pushRecords)) {
    await Kv.GetInstance().HDel(
      `push_subscriptions_1_${pushRecords[key].subscription.subscription.userId}`,
      "subscription"
    );
  }
  return {
    success: true,
  };
}
