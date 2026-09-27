"use client";

import React, { useContext, createContext } from "react";
import {
  useGetNotifications,
} from "@/hooks/user";
import { useAuth } from "./auth-provider";

type NotificatiionType = {
  notificationsData: any;
};

export const NotificationContext = createContext<NotificatiionType>({
  notificationsData: [],
});

export const useNotifications = () => {
  return useContext(NotificationContext);
};

const NotificationProvider = ({ children }: React.PropsWithChildren) => {
  const { isAccess } = useAuth();

  const { data: notificationsData } = useGetNotifications(50, 0, !!isAccess);

  const value: NotificatiionType = {
    notificationsData,
  };

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
};

export default NotificationProvider;
