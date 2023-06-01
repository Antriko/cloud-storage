import { useState, useContext } from 'react';
import { useRouter } from 'next/router';

import { UserContext } from '@/context/UserContext';
import FooterComponent from "@/components/footer"
import LoginComponent from "@/components/login"
import IndexUser from '@/components/indexUser';

export default function Home() {

    const router = useRouter()

    const userData = useContext(UserContext);

    // Replace login section with user info if logged in instead of redirect?
    // Continue as {USERNAME} >
    var userComponent = userData.username ? <IndexUser /> : <LoginComponent />


    return (
        <main>
            <div className="relative px-6 lg:px-8">
                <div className="mx-auto max-w-3xl pt-20 pb-32 sm:pt-48 sm:pb-40">
                    <div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight sm:text-center sm:text-6xl">
                                Cloud Storage
                            </h1>
                            <p className="mt-6 text-lg leading-8 sm:text-center">
                                Retain your data online securely yourself.
                            </p>
                            <div className="mt-8 flex gap-x-4 sm:justify-center">
                                {userComponent}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <FooterComponent />
        </main>
    )
}