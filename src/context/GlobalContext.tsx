"use client";

import { createContext, useContext, useEffect, useState } from "react";

type TokenData = any;

interface GlobalContextProps {
    tokenData: TokenData | null;
    setTokenData: (data: TokenData) => void;
}

const GlobalContext = createContext<GlobalContextProps>({
    tokenData: null,
    setTokenData: () => { },
});

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
    const [tokenData, setTokenData] = useState<TokenData | null>(null);

    // Load token khi khởi tạo (client-side)
    useEffect(() => {
        const getToken = async () => {
            try {
                const res = await fetch(`/api/proxy-auth`, {
                    method: "GET",
                    credentials: "include", // gửi cookie thật của user nếu cần
                });
                if (!res.ok) throw new Error("Không có dữ liệu");
                const data = await res.json();
                console.log("Fetched token data:", data);
                setTokenData(data);
            } catch (e) {
                console.error(e);
                setTokenData(null);
            }
        };

        getToken();
    }, []);

    return (
        <GlobalContext.Provider value={{ tokenData, setTokenData }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobal = () => useContext(GlobalContext);
