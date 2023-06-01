import { createContext, useState, useEffect } from "react";

export const UserContext = createContext({username: null, data: {}});

export function UserContextProvider({ children }) {
    const [userData, setUserData] = useState({username: null, data: {}});
    useEffect(() => {
        async function updateData() {
            const options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
            const verify = await fetch('/api/user/verify', options);
            if (verify.status == 401) {
                return;
            }
            const data = await verify.json();
            if (data.status == 201) {
                return;
            }
            setUserData({username: data.username, data: data.data})
        }
        updateData();
      }, []);

    return (
        <UserContext.Provider value={userData}>
            {children}
        </UserContext.Provider>
    )
}