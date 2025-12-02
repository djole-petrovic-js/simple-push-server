"use client";

import { useState } from "react";

import RemoveExistingSubscriptions from "../server-functions/removeExistingSubscriptions";

type ResponseDataItem = {
  userId: string;
  success: boolean;
  message?: string;
};

export default function TriggerNotification() {
  const [responseData, setResponseData] = useState<ResponseDataItem[] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTriggerNotification = async () => {
    setIsLoading(true);
    setError(null);
    setResponseData(null);

    fetch("/api/trigger", { method: "POST" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        return response.json();
      })
      .then((data) => {
        if (!data.success) {
          throw new Error(
            "Something went wrong while triggering notifications."
          );
        }

        setResponseData(data.responseData);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleRemoveSubscriptions = async () => {
    const response = await RemoveExistingSubscriptions();

    if (response.success) {
      // refresh the page to reflect changes
      window.location.reload();
    }
  };

  return (
    <div>
      <button
        className="bg-white text-black py-1 px-4 rounded-md cursor-pointer disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={handleTriggerNotification}
        disabled={isLoading}
      >
        Trigger Notification
      </button>

      <button
        onClick={handleRemoveSubscriptions}
        className="bg-white  mx-5 text-black py-1 px-4 rounded-md cursor-pointer disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Remove existing subscriptions
      </button>

      {error && <p className="text-red-500 mt-2">Error: {error}</p>}

      {responseData && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Response Data:</h3>
          <ul className="list-disc list-inside">
            {responseData.map(({ userId, success }) => (
              <li
                className={success ? "text-green-600" : "text-red-600"}
                key={userId}
              >
                User ID: {userId}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
