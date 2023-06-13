import { useContext, useEffect, useState } from "react"
import { UserContext } from '@/context/UserContext';
import { Folder } from 'react-bootstrap-icons'
import IconByName from "@/components/icon";

export default function Files() {
    const [files, setFiles] = useState({
        currentDir: "/",
        files: [],
        directory: [],
    })
    const [currentDir, setCurrentDir] = useState<string[]>(['/'])
    const userData = useContext(UserContext);

    useEffect(() => {
        async function fetchData() {
            const body = {
                directory: currentDir.join('')
            }
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            }

            const response = await fetch('/api/storage/files', options)
            const respData = await response.json();
            if (response.status === 200) {
                setFiles(respData)
            }
        }
        fetchData();
    }, [currentDir]);

    const changeDir = (event: any) => {
        setCurrentDir(currentDir.concat(`${event.currentTarget.value}/`))
    }

    const changeBackDir = (event: any) => {
        setCurrentDir(currentDir.slice(0, parseInt(event.currentTarget.value) + 1))
    }

    const goBack = () => {
        setCurrentDir(currentDir.length == 1 ? currentDir : currentDir.slice(0, -1))
    }

    const shorten = (text: string, limit: number) => {
        return text.length >= limit ? `${text.slice(0, limit-3)}...` : text
    }
    
    const getSize = (size: number) => {
        const k = size > 0 ? Math.floor((Math.log2(size)/10)) : 0;
        const rank = (k > 0 ? 'KMGT'[k - 1] : '') + 'B';
        const count = Math.floor(size / Math.pow(1024, k));
        return `${count} ${rank}`;
    }

    return(
        <div className='flex flex-col w-full'>
            {/* <button onClick={goBack} className="w-50 text-white bg-zinc-900 hover:bg-zinc-950 font-medium rounded-lg text-sm px-5 py-2.5 my-2 text-center">Go back</button> */}
            <div className='flex flex-wrap px-2'>
                {currentDir.map((dir, itt) => {
                    return(
                        <button key={dir} onClick={changeBackDir} value={itt} 
                            className="w-50 text-white bg-zinc-900 hover:bg-zinc-950 font-medium rounded-lg text-sm px-5 py-2.5 my-2 mx-0.5 text-center">
                                {dir}
                        </button>)
                })}
            </div>

            <div className='flex flex-wrap px-2'>
                {files.directory.map(dir => {
                    return(
                        <div className="w-40" key={dir['name']} >
                            <button onClick={changeDir} value={dir['name']} 
                                className="w-[95%] text-white bg-zinc-900 hover:bg-zinc-950 font-medium rounded-lg text-sm px-5 py-2.5 my-2 text-center">
                                    <Folder className="w-full h-3/4" />
                                    {shorten(dir['name'], 14)}
                            </button>
                        </div>
                    )
                })}
            </div>
            <div className='flex flex-wrap px-2'>
                <div className='flex flex-wrap w-full bg-zinc-900 font-medium rounded-lg text-lg py-3'>
                    <div className="w-full flex flex-wrap pl-5">
                        <div className='w-2/4'>
                            Name
                        </div>
                        <div className='w-1/4'> 
                            Modified
                        </div>
                        <div className='w-1/4'>
                            Size
                        </div>
                    </div>
                    {/* <div className='flex w-full hover:bg-zinc-950 pl-5 py-2'>
                        Empty...
                    </div> */}
                    {files.files.map(file => {
                        return(
                            <div key={file['name']} className='flex w-full hover:bg-zinc-950 pl-5 py-2'>
                                <div className='w-2/4 flex flex-wrap align-middle'>
                                    <div className="w-1/12">
                                        <IconByName name={file['name']} className="w-full h-full"/>
                                    </div>
                                    <div className="w-11/12 flex flex-col justify-center pl-2">
                                        {file['name']}
                                    </div>
                                </div>
                                {/* Hidden if sm: */}
                                <div className='w-1/4 flex flex-col justify-center'> 
                                    {/* 09/06/2023 14:12 PM - EXAMPLE*/}
                                    TODO
                                </div>
                                <div className='w-1/4 flex flex-col justify-center'>
                                    {getSize(file['size'])}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <br/>{JSON.stringify(files)}
            <br/>{JSON.stringify(currentDir)}
        </div>
    )
}