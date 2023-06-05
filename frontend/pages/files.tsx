import { useContext, useEffect, useState } from "react"
import { UserContext } from '@/context/UserContext';

export default function Files() {
    const [files, setFiles] = useState({
        currentDir: "/",
        files: [],
        directory: [],
    })
    const userData = useContext(UserContext);

    useEffect(() => {
        async function fetchData() {
            const body = {
                directory: files.currentDir
            }
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            }

            const data = await fetch('/api/storage/files', options)
        }
        fetchData();
    }, [files]);


    return(<div>cum</div>)
}