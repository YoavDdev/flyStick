// components/ProtectedPageWrapper.js

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

const ProtectedPageWrapper = (WrappedComponent) => {
  const Wrapper = (props) => {
    const { data: session } = useSession();
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchSubscriptionStatus = async () => {
        try {
          if (session?.user) {
            const response = await axios.post("/api/get-user-subsciptionId", {
              userEmail: session.user.email,
            });

            const userData = response.data;
            const subscriptionId = userData.subscriptionId;

            const clientId =
              "AUCQ4EpGcrWEqFKt5IBAAaixzjpYUn4CH-l35TSvPFbJhcF7lUbe6vaVDfAOMW2HSshM7PJ6GNKjT0Yw";
            const clientSecret =
              "ELs2eL9V_MaNK535C7pAWBEwnlMtBLZbkBcBUQw_wcXkw6kDRhuq8m0GZpME6WBjVL_qtMkdptvgvNby";

            const auth = {
              username: clientId,
              password: clientSecret,
            };

            const subscriptionResponse = await axios.get(
              `https://api.paypal.com/v1/billing/subscriptions/${subscriptionId}`,
              { auth },
            );

            const status = subscriptionResponse.data.status;
            setSubscriptionStatus(status);
          }
        } catch (error) {
          console.error("Error fetching subscription status:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchSubscriptionStatus();
    }, [session]);

    if (loading) {
      return (
        <div className="text-center pt-28">
          <h1 className="text-4xl font-semibold text-gray-700 mb-4">
            Loading...
          </h1>
        </div>
      );
    }

    if (subscriptionStatus === "ACTIVE") {
      return <WrappedComponent {...props} />;
    } else {
      return (
        <div className="text-center mt-28">
          <h1 className="text-4xl font-semibold text-gray-700 mb-4">
            Your subscription is not active. Please log in & subscribe to access
            this page.
          </h1>
          {/* Add your login link here */}
        </div>
      );
    }
  };

  return Wrapper;
};

export default ProtectedPageWrapper;
