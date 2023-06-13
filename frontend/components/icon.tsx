import {
    File,
    FileZip,
    FiletypeAac,
    FiletypeAi,
    FiletypeBmp,
    FiletypeCs,
    FiletypeCss,
    FiletypeCsv,
    FiletypeDoc,
    FiletypeDocx,
    FiletypeExe,
    FiletypeGif,
    FiletypeHeic,
    FiletypeHtml,
    FiletypeJava,
    FiletypeJpg,
    FiletypeJs,
    FiletypeJson,
    FiletypeJsx,
    FiletypeKey,
    FiletypeM4p,
    FiletypeMd,
    FiletypeMdx,
    FiletypeMov,
    FiletypeMp3,
    FiletypeMp4,
    FiletypeOtf,
    FiletypePdf,
    FiletypePhp,
    FiletypePng,
    FiletypePpt,
    FiletypePptx,
    FiletypePsd,
    FiletypePy,
    FiletypeRaw,
    FiletypeRb,
    FiletypeSass,
    FiletypeScss,
    FiletypeSh,
    FiletypeSql,
    FiletypeSvg,
    FiletypeTiff,
    FiletypeTsx,
    FiletypeTtf,
    FiletypeTxt,
    FiletypeWav,
    FiletypeWoff,
    FiletypeXls,
    FiletypeXlsx,
    FiletypeXml,
    FiletypeYml
} from "react-bootstrap-icons";
import { IconProps } from "react-bootstrap-icons";

interface BaseProps {
    name: string;
    className?: IconProps;
}

// const IconByName = (name: any, props: IconProps) => {
const IconByName = ({name, className}: IconProps) => {
    var regex = /(?:\.([^.]+))?$/
    // @ts-ignore
    var ext = regex.exec(name)[1]
    console.log('ext', ext, name, className)
    switch (ext) {
        case 'aac':
            return <FiletypeAac className={className} />;
        case 'ai':
            return <FiletypeAi className={className} />;
        case 'bmp':
            return <FiletypeBmp className={className} />;
        case 'cs':
            return <FiletypeCs className={className} />;
        case 'css':
            return <FiletypeCss className={className} />;
        case 'csv':
            return <FiletypeCsv className={className} />;
        case 'doc':
            return <FiletypeDoc className={className} />;
        case 'docx':
            return <FiletypeDocx className={className} />;
        case 'exe':
            return <FiletypeExe className={className} />;
        case 'gif':
            return <FiletypeGif className={className} />;
        case 'heic':
            return <FiletypeHeic className={className} />;
        case 'html':
            return <FiletypeHtml className={className} />;
        case 'java':
            return <FiletypeJava className={className} />;
        case 'jpg':
            return <FiletypeJpg className={className} />;
        case 'js':
            return <FiletypeJs className={className} />;
        case 'json':
            return <FiletypeJson className={className} />;
        case 'jsx':
            return <FiletypeJsx className={className} />;
        case 'key':
            return <FiletypeKey className={className} />;
        case 'm4p':
            return <FiletypeM4p className={className} />;
        case 'md':
            return <FiletypeMd className={className} />;
        case 'mdx':
            return <FiletypeMdx className={className} />;
        case 'mov':
            return <FiletypeMov className={className} />;
        case 'mp3':
            return <FiletypeMp3 className={className} />;
        case 'mp4':
            return <FiletypeMp4 className={className} />;
        case 'otf':
            return <FiletypeOtf className={className} />;
        case 'pdf':
            return <FiletypePdf className={className} />;
        case 'php':
            return <FiletypePhp className={className} />;
        case 'png':
            return <FiletypePng className={className} />;
        case 'ppt':
            return <FiletypePpt className={className} />;
        case 'pptx':
            return <FiletypePptx className={className} />;
        case 'psd':
            return <FiletypePsd className={className} />;
        case 'py':
            return <FiletypePy className={className} />;
        case 'raw':
            return <FiletypeRaw className={className} />;
        case 'rb':
            return <FiletypeRb className={className} />;
        case 'sass':
            return <FiletypeSass className={className} />;
        case 'scss':
            return <FiletypeScss className={className} />;
        case 'sh':
            return <FiletypeSh className={className} />;
        case 'sql':
            return <FiletypeSql className={className} />;
        case 'svg':
            return <FiletypeSvg className={className} />;
        case 'tiff':
            return <FiletypeTiff className={className} />;
        case 'tsx':
            return <FiletypeTsx className={className} />;
        case 'ttf':
            return <FiletypeTtf className={className} />;
        case 'txt':
            return <FiletypeTxt className={className} />;
        case 'wav':
            return <FiletypeWav className={className} />;
        case 'woff':
            return <FiletypeWoff className={className} />;
        case 'xls':
            return <FiletypeXls className={className} />;
        case 'xlsx':
            return <FiletypeXlsx className={className} />;
        case 'xml':
            return <FiletypeXml className={className} />;
        case 'yml':
            return <FiletypeYml className={className} />;
        case 'zip':
            return <FileZip className={className} />;
        default:
            return <File className={className} />;
    }
}

export default IconByName;