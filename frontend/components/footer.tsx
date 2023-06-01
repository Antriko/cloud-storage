import Link from "next/link";

export default function FooterComponent() {
    return (
        <div className="bg-zinc-900 fixed bottom-0 left-0 w-screen py-2 px-10 font-bold text-lg text-right">
            <Link href="https://github.com/Antriko/cloud-storage/" rel="noopener noreferrer" target="_blank">GitHub</Link>
        </div>
    )
}