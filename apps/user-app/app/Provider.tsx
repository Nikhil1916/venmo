"use client"
import { Provider, store } from "@repo/store/index";

export default function ProviderComponent({
  children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Provider store={store}>
            {children}
        </Provider>
    )
}