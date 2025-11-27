import React from 'react'
import { FaFile } from 'react-icons/fa6'
import { IoClose } from 'react-icons/io5'

// Add icon
export const AddIcon = () => {
    return <div className="addIcon">+</div>
}

//Icon for Reset
export const ResetIcon = () => {
    return <img src="/dist/Images/lock1.png" height="20px" alt="reset" />
}

// gif for loader
export const LoaderGif = ({ height, width }) => {
    return <img src="/dist/Images/loading.gif" height={height} width={width} alt="loader" />
}

// Right arrow for next
export const RightArrow = () => {
    return <img src="/dist/Images/right-round_svgrepo.com.png" height="30px" alt="reset" />
}

// edit icon form fontawsome icon
export const EditIcon = () => {
    return <i class="fa-solid fa-file-pen fa-lg edit"></i>
}
// delete icon form fontawsome icon
export const DeleteIcon = () => {
    return <i class="fa-solid fa-trash fa -lg delete"></i>
}

// Icon for approove actions
export const ApproveIcon = () => {
    return <img src="/dist/Images/approve.png" height="20px" alt="approve" />
}
// Icon for Rejection actions
export const RejectIcon = () => {
    return <img src="/dist/Images/reject.png" height="20px" alt="reject" />
}
// Icon for change content actions
export const ChangeIcon = () => {
    return <img src="/dist/Images/change.png" height="20px" alt="reject" />
}
// Icon for Cancel actions
export const CancelIcon = () => {
    return <img src="/dist/OceanImages/cancel.png" height="20px" alt="reject" />
}
// Icon for unlock actions
export const UnLock = () => {
    return <img src="/dist/Images/lock.png" height="20px" alt="lock" />
}

// Email icon
export const Email = () => {
    return <img src="/dist/Images/email.png" height="20px" alt="lock" />
}

// Icon for showing active
export const OnSwitch = () => {
    return <img src="/dist/OceanImages/switchOn.png" height="30px" alt="on" />
}

// Icon for showing inactive
export const OffSwitch = () => {
    return <img src="/dist/OceanImages/switchOff.png" height="30px" alt="off" />
}

// Image for holidays
export const HolidayBanner = () => {
    return <img src="/dist/Images/HolidayBanner.jpg" height="20px" alt="off" />
}

// View Icon
export const ViewAction = () => {
    return <img src="/dist/Images/development.png" height="20px" alt="off" />
}
// Pdf Icon
export const Pdf = () => {
    return <img src="/dist/OceanImages/files.png" height="20px" alt="off" />
}

// Review icon
export const ActionIcon = () => {
    return <img src="/dist/OceanImages/reviewExp.png" height="20px" alt="off" />
}

// comment icon
export const CommentIcon = () => {
    return <img src="/dist/Images/comments.png" height="20px" alt="off" />
}
// file view icon
export const ViewFile = ({ size }) => {
    return <img src="/dist/Images/viewFile.png" height={size ? size : '20px'} alt="off" />
}
// edit icon with image
export const EditFile = () => {
    return <img src="/dist/Images/EditFile.png" height="20px" alt="off" />
}
// cancle icon with image
export const CancelationIcon = () => {
    return <img src="/dist/OceanImages/CancellationIcon.png" height="20px" alt="off" />
}

// cancle icon in color blue
export const Cancelation = () => {
    return <img src="/dist/OceanImages/CancelBlue.png" height="20px" alt="off" />
}

// file icon
export const File = ({ color, size }) => {
    return <FaFile style={{ color: color }} size={size} />
}

// icon for annexure
export const AnxDocument = () => {
    return <img src="/dist/OceanImages/document.png" height="20px" alt="off" />
}
// icon for compensation
export const CompIcon = () => {
    return <img src="/dist/OceanImages/compensationIcon.png" height="20px" alt="off" />
}
// document icon
export const Doc = ({ height }) => {
    return <img src="/dist/OceanImages/pdf.png" height={height} alt="off" />
}
// off boarding icon
export const OffBoard = ({ height }) => {
    return <img src="/dist/Images/offBoard.png" height={height} alt="off" />
}

// alert icon
export const OffBoardAlert = ({ height }) => {
    return <img src="/dist/Images/alertOffBoard.png" height={height} alt="off" />
}

// doc icon
export const DocHover = ({ height }) => {
    return <img src="/dist/OceanImages/pdfHover.png" height={height} alt="off" />
}

// xlsheet icon
export const XlSheet = ({ height }) => {
    return <img src="/dist/OceanImages/XlSheet.png" height={height} alt="off" />
}

// printer icon
export const Printer = ({ height }) => {
    return <img src="/dist/OceanImages/printer.png" height={height} alt="off" />
}

// mail icon
export const NewEmail = ({ height, size }) => {
    return (
        <img
            src="/dist/Images/new-email.png"
            height={height ? height : '30px'}
            size={size ? size : '30px'}
            alt="off"
        />
    )
}

// pjone icon
export const Phone = ({ height, size }) => {
    return (
        <img
            src="/dist/Images/phone.png"
            height={height ? height : '30px'}
            size={size ? size : '30px'}
            alt="off"
        />
    )
}

// copy icon
export const CopyContent = ({ height, size }) => {
    return (
        <img
            src="/dist/SVGs/CopyContent.svg"
            height={height ? height : '10px'}
            size={size ? size : '30px'}
            alt="off"
        />
    )
}
// close icon
export const CloseIcon = () => {
    return <IoClose />
}
// danger icon
export const DangerIcon = ({ height, size }) => {
    return (
        <img
            src="/dist/Images/danger.png"
            height={height ? height : '10px'}
            size={size ? size : '30px'}
            alt="off"
        />
    )
}
