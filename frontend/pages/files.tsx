import React, { useContext, useEffect, useState, useCallback } from "react"
import { UserContext } from '@/context/UserContext';
import { Folder } from 'react-bootstrap-icons'
import IconByName from "@/components/icon";
import { useDropzone } from 'react-dropzone'

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export default function Files() {
    const [files, setFiles] = useState({
        currentDir: "/",
        files: [],
        directory: [],
    })
    const [currentDir, setCurrentDir] = useState<string[]>(['/'])
    const [reload, setReload] = useState(false)
    const userData = useContext(UserContext);
    const [selected, setSelected] = useState<any>({selected: null, data: {}})

    const onDrop = useCallback((files: any) => {
        async function uploadFiles() {
            var formData = new FormData();

            files.forEach((file: any) => {
                formData.append('files', file)
            });
            formData.append('directory', currentDir.join(''))
            console.log(formData.getAll('files'))
            const options = {
                method: 'POST',
                body: formData
            }
            // Uploading status perhaps?
            const response = await fetch('/api/storage/upload', options)
            const respData = await response.json();
            console.log(respData)
            if (response.status === 200) {
                setReload(reload ? false : true)
            }
        }
        uploadFiles();
    }, [currentDir, reload])
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

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
    }, [currentDir, reload]);
    



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

    const changeFile = (event: any) => {
        setSelected({selected: event.currentTarget.id})
        console.log(event.currentTarget)
    }
    const downloadFile = () => {
        async function download() {
            const body = {
                directory: currentDir.join(''),
                filename: selected.selected,
            }
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            }

            const response = await fetch('/api/storage/download', options)
            console.log(response.arrayBuffer)
            response.headers.forEach(function(val, key) { console.log(key + ' -> ' + val); });

        }
        download();
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
                <div className="w-40">
                    <div className="w-[95%] text-white bg-zinc-900 font-medium rounded-lg text-sm px-5 py-2.5 my-2 text-center">
                                    <Folder className="w-full h-3/4" />
                                    Directories
                            </div>
                        </div>
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
                <div className='flex flex-col w-3/5 bg-zinc-900 font-medium rounded-lg text-lg py-3'>
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
                    {files.files.map(file => {
                        var select = selected.selected == file['name'] ? 'bg-zinc-950' : ''
                        return(
                            <button id={file['name']} key={file['name']} onClick={changeFile} value={file['name']} className={classNames(select, 'flex w-full hover:bg-zinc-950 pl-5 py-2')}>
                                <div className='w-2/4 flex flex-wrap align-middle text-left'>
                                    <div className="w-1/12">
                                        <IconByName name={file['name']} className="w-full h-full"/>
                                    </div>
                                    <div className="w-11/12 flex flex-col justify-center pl-2">
                                        {file['name']}
                                    </div>
                                </div>
                                {/* Hidden if sm: */}
                                <div className='w-1/4 flex flex-col justify-center text-left'> 
                                    {/* 09/06/2023 14:12 PM - EXAMPLE*/}
                                    TODO
                                </div>
                                <div className='w-1/4 flex flex-col justify-center text-left'>
                                    {getSize(file['size'])}
                                </div>
                            </button>
                        )
                    })}

                    <div {...getRootProps()} className='flex mt-auto w-full p-5'>
                        <div className='flex w-full border border-white border-dashed px-4 py-3 hover:bg-zinc-950 rounded-lg'>
                            <input {...getInputProps()} />
                            {
                                isDragActive ?
                                <p>Drop the files here...</p> :
                                <p>Drag and drop files here, or click to select files</p>
                            }
                        </div>
                    </div>

                </div>
                <div className='flex flex-wrap w-2/5'>
                    <div className='flex flex-col w-full bg-zinc-900 font-medium rounded-lg text-lg py-3 px-5 ml-2'>
                        { !selected.selected ? 
                            <div className='flex flex-box w-full text-3xl pt-4 justify-center'>
                                Select a file
                            </div> : 
                            <React.Fragment>
                                <div className='flex flex-box w-full text-3xl pt-4 justify-center'>
                                    {selected.selected}
                                </div>
                                {/* MORE INFORMATION */}
                                <div className='flex flex-box w-full py-5 mt-auto'>
                                    <div className='w-3/5 px-2'>
                                        <button onClick={downloadFile} className='w-full text-white bg-zinc-950 font-medium rounded-lg text-base px-5 py-2.5 text-center'>
                                            Download
                                        </button>
                                    </div>
                                    <div className='w-2/5 px-2'>
                                        <button className='w-full text-white bg-rose-900 hover:bg-rose-950 font-medium rounded-lg text-base px-5 py-2.5 text-center'>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </React.Fragment>
                        }
                    </div>
                </div>
            </div>
            <br/>{JSON.stringify(files)}
            <br/>{JSON.stringify(currentDir)}
            <br/>{JSON.stringify(selected)}
        </div>
    )
}