"use client";

import { Analytics } from "@vercel/analytics/react";

const AnalyticsWrapper = () => {
  const beforeSend = (event: any) => {
    // Modify the event URL to remove the key or sensitive information
    event.url = event.url.replace(
      /\/dashboard\/new\/[a-f0-9-]+/gi,
      "/dashboard/new/"
    );
    return event;
  };

  return <Analytics beforeSend={beforeSend} />;
};

export default AnalyticsWrapper;
