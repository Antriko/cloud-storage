import React, { useEffect, useState, useCallback } from "react"
import { Folder, FolderPlus, Diagram2Fill, Search, House, Download, Trash, Check, X } from 'react-bootstrap-icons'
import IconByName from "@/components/icon";
import { useDropzone } from 'react-dropzone'
import Link from "next/link";

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
    const [search, setSearch] = useState({
        isSearch: false,
        results: [],
    })
    const [selected, setSelected] = useState<any>({
        selected: '', 
        data: {
            filename: '',
            description: '',
            lastModified: '',
            uploadedBy: '',
            size: '',
            path: '',
        }
    })
    const [currentDirectory, setCurrentDirectory] = useState({
        id: '',
        path: '/',
        name: '/',
        joint: [{
            dirname: '/',
            id: ''
        }],
    })

    const [createDirectory, setCreateDirectory] = useState({
        isCreating: false,
        name: '',
    })

    const onDrop = useCallback((files: any) => {
        async function uploadFiles() {
            var formData = new FormData();

            files.forEach((file: any) => {
                formData.append('files', file)
            });
            formData.append('directory', currentDirectory.id)
            const options = {
                method: 'POST',
                body: formData
            }
            // Uploading status perhaps?
            const response = await fetch('/api/storage/upload', options)
            const respData = await response.json();
            if (response.status === 200) {
                setReload(reload ? false : true)
            }
        }
        uploadFiles();
    }, [currentDirectory, reload])
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

    useEffect(() => {
        async function fetchData() {
            const dirResponse = await fetch('/api/storage/baseDirectory')
            if (dirResponse.status !== 200) return
            const dirData = await dirResponse.json();


            const body = {
                directory: currentDirectory.id ? currentDirectory.id : dirData.id,
            }
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            }
            const response = await fetch('/api/storage/files', options)
            if (response.status !== 200) return
            const respData = await response.json();
            setFiles(respData)
        }
        fetchData();
    }, [currentDirectory.id, reload]);
    

    



    const changeDir = async(event: any) => {
        const body = {
            directory: event.currentTarget.value,
        }
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        }
        const response = await fetch('/api/storage/directoryInfo', options)
        if (response.status !== 200) return
        const respData = await response.json();
        setCurrentDirectory(respData)
        setSearch({isSearch: false, results: search.results})
    }

    const changeBackDir = async(event: any) => {
        const body = {
            directory: event.currentTarget.value,
        }
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        }
        const response = await fetch('/api/storage/directoryInfo', options)
        if (response.status !== 200) return
        const respData = await response.json();
        setCurrentDirectory(respData)
        setSearch({isSearch: false, results: search.results})
    }

    const setCreating = () => {
        setCreateDirectory({isCreating: true, name:''})
    }
    const setDirectory = (event: any) => {
        setCreateDirectory({isCreating: true, name: event.currentTarget.value})
    }
    const removeDirectory = (event: any) => {
        setCreateDirectory({isCreating: false, name: ''})
    }

    const submitDirectory = async() => {
        const body = {
            dirname: createDirectory.name,
            parentDirectory: currentDirectory.id,
        }
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        }
        const response = await fetch('/api/storage/createDirectory', options)
        if (response.status === 200) {
            setCreateDirectory({isCreating: false, name: ''})
            setReload(reload ? false : true)
        }
    }

    const searchFunction = async(event: any) => {
        if(event.currentTarget.value == '') {
            setSearch({
                isSearch: false,
                results: search.results,
            })
            return;
        }
        const body = {
            searchTerm: event.currentTarget.value
        }
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        }
        const response = await fetch('/api/storage/search', options)
        if(response.status !== 200) return;
        const data = await response.json()
        setSearch({
            isSearch: true,
            results: data,
        })
    }
    
    const getSize = (size: number) => {
        const k = size > 0 ? Math.floor((Math.log2(size)/10)) : 0;
        const rank = (k > 0 ? 'KMGT'[k - 1] : '') + 'B';
        const count = Math.floor(size / Math.pow(1024, k));
        return `${count} ${rank}`;
    }

    const saveDescription = async(event: any) => {
        var data = selected.data
        data.description = event.currentTarget.value
        setSelected({
            selected: selected.selected,
            data: data,
        })
        const body = {
            id: selected.selected,
            description: event.currentTarget.value
        }
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        }
        const response = await fetch('/api/storage/setDescription', options)
    }

    const changeFile = async(event: any) => {
        var selectedFile = event.currentTarget.value
        const body = {
            file: event.currentTarget.value
        }
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        }
        const response = await fetch('/api/storage/fileInfo', options)
        if(response.status !== 200) return;
        const data = await response.json()
        setSelected({selected: selectedFile, data: data})
    }

    var renderFile = search.isSearch ? search.results : files.files
    return(
        <div className='flex flex-col w-full'>
            <div className='flex flex-wrap px-2 bg-zinc-900'>
                <div className="w-3/5">
                    {currentDirectory.joint.map((val, index, array) => array[array.length - 1 - index]).map(dir => {
                        return(
                            <button key={dir['id']} onClick={changeBackDir} value={dir['id']} 
                            className="w-50 text-white bg-zinc-800 hover:bg-zinc-950 font-medium rounded-lg text-sm px-5 py-2.5 my-2 mx-0.5 text-center">
                                    {dir['dirname']}
                            </button>)
                    })}
                </div>
                <div className="relative flex flex-box w-2/5">
                    <div className="flex flex-box w-9/12 md:w-10/12">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                            <Search className="w-5 h-5 text-gray-400" />
                        </div>
                        <input type="search" className="block w-full rounded-lg my-2 ml-2 pr-4 pl-10 bg-zinc-800" onChange={searchFunction} placeholder="Search..." />
                    </div>
                    <div className="flex flex-box ml-auto mr-auto w-2/12 md:w-1/12">
                        <Link href={'/'} className="relative w-full text-white bg-zinc-800 hover:bg-zinc-950 font-medium rounded-lg text-sm px-5 pt-2.5 my-2 mx-0.5 text-center">
                            <House className="absolute w-full h-3/4 inset-y-1 left-0 text-gray-400"/>
                        </Link>
                    </div>
                </div>
            </div>
            <div className={classNames(createDirectory.isCreating ? '' : 'hidden', `w-full flex flex-box px-2 mt-2`)}>
                <input type="text" onChange={setDirectory} className="block w-2/6 rounded-lg my-2 py-2 pr-4 pl-10 bg-zinc-900" value={createDirectory.name} placeholder="Directory name..." />
                <div className="flex flex-box w-full">
                    <button onClick={submitDirectory} className='relative w-1/12 my-2 ml-2 text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-base text-center'>
                        <Check className="absolute w-full h-full inset-y-0 inset-x-0 text-white" />
                    </button>

                    <button onClick={removeDirectory} className='relative w-1/12 my-2 ml-2 text-white bg-rose-900 hover:bg-rose-950 font-medium rounded-lg text-base text-center'>
                        <X className="absolute w-full h-full inset-y-0 inset-x-0 text-white" />
                    </button>
                </div>
            </div>

            <div className='flex flex-box mx-2 overflow-x-scroll scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-zinc-900 scrollbar-radius scrollbar-thumb-rounded scrollbar-track-rounded mb-2'>
                <div className="w-40 flex flex-none">
                    <div className="w-[95%] text-white bg-zinc-900 font-medium rounded-lg text-sm px-5 py-2.5 my-2 text-center">
                        <Diagram2Fill className="w-full h-3/4" />
                        Directories
                    </div>
                </div>
                <div className="w-20 flex flex-none flex-col justify-end">
                    <button onClick={setCreating} className="w-[90%] text-white bg-zinc-900 hover:bg-zinc-950 font-medium rounded-lg text-sm p-5 my-2">
                        <FolderPlus className="w-full h-full" />
                    </button>
                </div>
                <div className="flex flex-none flex-nowrap w-100 ">
                    {files.directory.map(dir => {
                        return(
                            <div className="w-40" key={dir['id']}  >
                                <button onClick={changeDir} value={dir['id']} 
                                    className="w-[95%] text-white bg-zinc-900 hover:bg-zinc-950 font-medium rounded-lg text-sm px-5 py-2.5 my-2 text-center">
                                        <Folder className="w-full h-3/4" />
                                        <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                                            {dir['dirname']}
                                        </div>
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className='flex flex-col-reverse md:flex-row px-2'>
                <div className='flex flex-col w-full md:w-3/5 bg-zinc-900 font-medium rounded-lg text-lg py-3'>
                    <div className="w-full flex flex-wrap pl-5 justify-between">
                        <div className='w-2/4'>
                            Name
                        </div>
                        <div className='w-1/4 mr-3'>
                            Size
                        </div>
                    </div>
                    <div className="overflow-y-scroll h-96 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-zinc-800 scrollbar-radius scrollbar-thumb-rounded scrollbar-track-rounded mr-2">
                        {renderFile.map(file => {
                            var select = selected.selected == file['id'] ? 'bg-zinc-950' : ''
                            return(
                                <button id={file['id']} key={file['id']} onClick={changeFile} value={file['id']} className={classNames(select, 'flex w-full hover:bg-zinc-950 pl-5 py-2 justify-between')}>
                                    <div className='w-2/4 flex flex-wrap align-middle text-left'>
                                        <div className="w-1/12">
                                            <IconByName name={file['name']} className="w-full h-full"/>
                                        </div>
                                        <div className="w-11/12 flex flex-col justify-center pl-2">
                                            {file['name']}
                                        </div>
                                    </div>
                                    <div className='w-1/4 flex flex-col justify-center text-left'>
                                        {getSize(file['size'])}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
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
                <div className='flex flex-wrap w-full md:w-2/5 md:ml-2 mb-2 md:mb-0'>
                    <div className='flex flex-col w-full bg-zinc-900 font-medium rounded-lg text-lg py-3 px-5'>
                        { !selected.selected ? 
                            <div className='flex flex-box w-full text-3xl pt-4 justify-center'>
                                Select a file
                            </div> : 
                            <React.Fragment>
                                <div className='flex flex-box w-full text-3xl pt-4 justify-center'>
                                    {selected.data.filename}
                                </div>
                                <div className='flex flex-col w-full pb-4'>
                                    <div className='w-full font-semibold'>
                                        Description
                                    </div>
                                    <input onChange={saveDescription} type='textarea' className='w-full font-normal bg-zinc-800 rounded-lg p-3 mt-2' placeholder='Add description...' 
                                        value={selected.data.description ? selected.data.description : ''} />
                                        {/* {selected.data.description ? selected.data.description : 'Add description...'} */}
                                </div>
                                <div className='flex flex-col w-full pb-4 mt-auto'>
                                    <div className='w-full font-semibold-auto'>
                                        Last Modified
                                    </div>
                                    <div className='w-full font-normal'>
                                        { selected.data.lastModified ? new Date(selected.data.lastModified).toUTCString() : 'Unknown'}
                                    </div>
                                </div>
                                <div className='flex flex-col w-full pb-4'>
                                    <div className='w-full font-semibold'>
                                        Uploaded by
                                    </div>
                                    <div className='w-full font-normal'>
                                        {selected.data.uploadedBy ? selected.data.uploadedBy : 'Unknown'}
                                    </div>
                                </div>
                                <div className='flex flex-col w-full pb-4'>
                                    <div className='w-full font-semibold'>
                                        Size
                                    </div>
                                    <div className='w-full font-normal'>
                                        {selected.data.size ? getSize(selected.data.size) : 'Unknown'}
                                    </div>
                                </div>
                                <div className='flex flex-col w-full pb-4'>
                                    <div className='w-full font-semibold'>
                                        Path
                                    </div>
                                    <div className='w-full font-normal'>
                                        {selected.data.path ? selected.data.path : 'Unknown'}
                                    </div>
                                </div>
                                
                                <div className='flex flex-box w-full py-5'>
                                    <div className='w-3/5 pr-2'>
                                        <a href={`/api/storage/download/${selected.selected}`}>
                                            <button className='relative w-full text-white bg-zinc-950 font-medium rounded-lg text-base px-5 py-2.5 text-center'>
                                                <Download className="absolute w-full h-3/4 inset-y-1.5 -left-[33%] text-gray-400" />
                                                Download
                                            </button>
                                        </a>
                                    </div>
                                    <div className='w-2/5 pl-2'>
                                        <button className='relative w-full text-white bg-rose-900 hover:bg-rose-950 font-medium rounded-lg text-base px-5 py-2.5 text-center'>
                                            <Trash className="absolute w-full h-3/4 inset-y-1.5 -left-[33%] text-gray-400" /> 
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </React.Fragment>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}