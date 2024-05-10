"use client";

import { Analytics } from "@vercel/analytics/react";

const AnalyticsWrapper = () => {
  const beforeSend = (event: any) => {
    event.url = event.url.replace(
      /\/dashboard\/new\/[a-f0-9-]+/gi,
      "/dashboard/new/"
    );

    event.url = event.url.replace(
      /\/dashboard\/show\/[a-f0-9-]+/gi,
      "/dashboard/show/"
    );

    return event;
  };

  return <Analytics beforeSend={beforeSend} />;
};

export default AnalyticsWrapper;
