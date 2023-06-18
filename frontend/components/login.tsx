// @ts-nocheck
import Link from "next/link";
import { useState, useContext } from 'react';
import { useRouter } from 'next/router';

import { UserContext } from '@/context/UserContext';

export default function LoginComponent() {

    const [message, setMessage] = useState({message: false, text: ''})
    const router = useRouter()
    const userData = useContext(UserContext);

    const HandleSubmit = async (event) => {
        event.preventDefault();
        const data = {
            username: event.target.username.value,
            password: event.target.password.value
        }
        console.log('Form data', data)

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }
        const response = await fetch('/api/user/login', options)
        if (response.status == 200) {
            router.reload();
            return;
        }

        if (response.status == 502) {
            setMessage({message: true, text: 'Cannot connect to server - check logs'})
            return;
        }

        const respData = await response.json();
        console.log(response, respData, response.status)
        setMessage({message: true, text: respData.text})
    }

    return (
        <div className="flex flex-col w-full items-center justify-center px-6 py-8 mx-auto">
            <div className="w-full bg-zinc-700 text-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 px-6 py-8">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 className="text-xl font-bold leading-tight tracking-tight">
                        Sign in to your account
                    </h1>
                    <form onSubmit={HandleSubmit} className="w-full text-2xl">
                        <div className="py-3">
                            <label htmlFor="username" className="block mb-2 text-sm font-medium">
                                Username
                            </label>
                            <input id="username" name="username" type="text" autoComplete="current-username" required
                                className="bg-white border border-zinc-950 text-zinc-900 sm:text-sm rounded-lg block w-full p-2.5"
                                placeholder="Username" />
                        </div>
                        <div className="py-3">
                            <label htmlFor="password" className="block mb-2 text-sm font-medium">
                                Password
                            </label>
                            <input id="password" name="password" type="password" autoComplete="current-password" required
                                className="bg-white border border-zinc-950 text-zinc-900 sm:text-sm rounded-lg block w-full p-2.5"
                                placeholder="Password" />
                        </div>
                        <div className="flex items-center justify-between pt-3 pb-2">
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input id="remember" aria-describedby="remember" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" required="" />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="remember">Remember me</label>
                                </div>
                            </div>
                            <p className="text-sm font-light">{message.text}</p>
                    </div>
                    <button type="submit" className="w-full text-white bg-zinc-900 hover:bg-zinc-950 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Sign in</button>
                    </form>
                </div>
            </div>
        </div>
    )
}