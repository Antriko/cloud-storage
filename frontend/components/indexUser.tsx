import Link from "next/link";
import { useContext } from 'react';
import { useRouter } from "next/router";

import { UserContext } from '@/context/UserContext';

export default function IndexUser() {
    const userData = useContext(UserContext);
    const router = useRouter();
    const Signout = async () => {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }
        await fetch('/api/user/logout', options);
        router.reload();
    }

    return (
        <div className="flex flex-col w-full items-center justify-center px-6 py-8 mx-auto lg:py-0">
            <div className="w-full bg-zinc-700 text-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 px-6 py-8">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 className="text-xl leading-tight tracking-tight">
                        Welcome back <span className="font-bold">{userData.username}</span>
                    </h1>
                    <Link type="button" href="files" className="btn w-full text-white bg-zinc-900 hover:bg-zinc-950 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Continue</Link>
                    <button className="w-full text-white bg-zinc-900 hover:bg-zinc-950 font-medium rounded-lg text-sm px-5 py-2.5 text-center" onClick={Signout}>Log off</button>
                </div>
            </div>
        </div>
    )
}