import TriggerNotification from "./components/TriggerNotification";
/**
 * Storage.
 */
import Kv from "@/app/lib/storage/kv";

// Force this page to never be cached
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const pushRecords = await Kv.GetInstance().GetRecordsByPrefix(
    "push_subscriptions_1_"
  );

  const allSubscriptions = [];

  for (const key of Object.keys(pushRecords)) {
    allSubscriptions.push({
      userId: pushRecords[key].subscription.subscription.userId,
    });
  }

  return (
    <div className="flex items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        {/* Show all current subscriptions in a list */}
        {allSubscriptions.length > 0 && (
          <div className="my-8">
            <h2 className="text-xl mb-4">Current Subscriptions:</h2>
            <ul className="list-disc list-inside">
              {allSubscriptions.map((sub) => (
                <li key={sub.userId}>User ID: {sub.userId}</li>
              ))}
            </ul>
          </div>
        )}

        {allSubscriptions.length === 0 && (
          <p className="mb-8">No current subscriptions.</p>
        )}

        <TriggerNotification />
      </main>
    </div>
  );
}
