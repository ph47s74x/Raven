import { Box, Button, HStack, IconButton, Link, Popover, PopoverContent, PopoverTrigger, Portal, Tooltip, useColorMode } from '@chakra-ui/react'
import { BsDownload, BsEmojiSmile } from 'react-icons/bs'
import { useFrappeCreateDoc, useFrappePostCall } from 'frappe-react-sdk'
import { useContext, useEffect } from 'react'
import { AiOutlineEdit } from 'react-icons/ai'
import { VscTrash } from 'react-icons/vsc'
import { IoBookmark, IoBookmarkOutline, IoChatboxEllipsesOutline } from 'react-icons/io5'
import { UserContext } from '../../../utils/auth/UserProvider'
import { DeleteMessageModal } from '../message-details/DeleteMessageModal'
import { EditMessageModal } from '../message-details/EditMessageModal'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import { ModalTypes, useModalManager } from '../../../hooks/useModalManager'
import { FileMessage, Message, TextMessage } from '../../../types/Messaging/Message'

interface ActionButtonPaletteProps {
    message: Message,
    showButtons: {}
    handleScroll: (newState: boolean) => void,
    is_continuation: 1 | 0,
    replyToMessage?: (message: Message) => void
    mutate: () => void
}

export const ActionsPalette = ({ message, showButtons, handleScroll, is_continuation, mutate, replyToMessage }: ActionButtonPaletteProps) => {

    const { name, owner, message_type } = message

    let text = ''
    let file = ''

    if (message_type === 'File' || message_type === 'Image') {
        const { file: fileValue } = message as FileMessage
        file = fileValue
    } else if (message_type === 'Text') {
        const { text: textValue } = message as TextMessage
        text = textValue
    }

    const modalManager = useModalManager()

    const onDeleteMessageModalOpen = () => {
        modalManager.openModal(ModalTypes.DeleteMessage)
    }

    const onEditMessageModalOpen = () => {
        text && modalManager.openModal(ModalTypes.EditMessage)
    }

    const onEmojiPickerOpen = () => {
        modalManager.openModal(ModalTypes.EmojiPicker)
    }

    const onEmojiClick = (emojiObject: EmojiClickData) => {
        saveReaction(emojiObject.emoji)
        modalManager.closeModal()
    }

    const { colorMode } = useColorMode()
    const BGCOLOR = colorMode === 'light' ? 'white' : 'black'
    const BORDERCOLOR = colorMode === 'light' ? 'gray.200' : 'gray.700'

    const { currentUser } = useContext(UserContext)
    const { createDoc } = useFrappeCreateDoc()

    const saveReaction = (emoji: string) => {
        if (name) return createDoc('Raven Message Reaction', {
            reaction: emoji,
            user: currentUser,
            message: name
        })
    }

    useEffect(() => {
        handleScroll(modalManager.modalType !== ModalTypes.EmojiPicker)
    }, [modalManager.modalType])
  
    const onReplyClick = () => {
        replyToMessage && replyToMessage(message)
    }
        
    const { call } = useFrappePostCall('frappe.desk.like.toggle_like')

    const handleLike = (id: string, value: string) => {
        call({
            doctype: 'Raven Message',
            name: id,
            add: value
        }).then((r) => mutate())
    }

    const checkLiked = (likedBy: string) => {
        return JSON.parse(likedBy ?? '[]')?.length > 0 && JSON.parse(likedBy ?? '[]')?.includes(currentUser)
    }

    return (
        <Box
            rounded='md'
            bgColor={BGCOLOR}
            p='1'
            style={showButtons}
            boxShadow='bottom'
            border='1px'
            borderColor={BORDERCOLOR}
            width='fit-content'
            zIndex={2}
            position='absolute'
            top={is_continuation === 0 ? -4 : -7}
            right={2}>
            <HStack spacing={1}>
                <EmojiButton emoji={'✅'} label={'done'} onClick={() => saveReaction('✅')} />
                <EmojiButton emoji={'👀'} label={'looking into this...'} onClick={() => saveReaction('👀')} />
                <EmojiButton emoji={'🎉'} label={'great job!'} onClick={() => saveReaction('🎉')} />
                <Box>
                    <Popover
                        isOpen={modalManager.modalType === ModalTypes.EmojiPicker}
                        onClose={modalManager.closeModal}
                        placement='auto-end'
                        isLazy
                        lazyBehavior="unmount"
                        gutter={48}>
                        <PopoverTrigger>
                            <Tooltip hasArrow label='find another reaction' size='xs' placement='top' rounded='md'>
                                <IconButton size='xs' aria-label={"pick emoji"} icon={<BsEmojiSmile />} onClick={onEmojiPickerOpen} />
                            </Tooltip>
                        </PopoverTrigger>
                        <Portal>
                            <Box zIndex={10}>
                                <PopoverContent border={'none'} rounded='lg'>
                                    {/* @ts-ignore */}
                                    <EmojiPicker onEmojiClick={onEmojiClick} lazyLoadEmojis theme={colorMode === 'light' ? 'light' : 'dark'} />
                                </PopoverContent>
                            </Box>
                        </Portal>
                    </Popover>
                </Box>
                <Tooltip hasArrow label='reply' size='xs' placement='top' rounded='md'>
                    <IconButton
                        onClick={onReplyClick}
                        aria-label="reply"
                        icon={<IoChatboxEllipsesOutline fontSize={'0.8rem'} />}
                        size='xs' />
                </Tooltip>
                {(owner === currentUser) && text &&
                    <Tooltip hasArrow label='edit' size='xs' placement='top' rounded='md'>
                        <IconButton
                            onClick={onEditMessageModalOpen}
                            aria-label="edit message"
                            icon={<AiOutlineEdit fontSize={'0.82rem'} />}
                            size='xs' />
                    </Tooltip>
                }
                <Tooltip hasArrow label={checkLiked(message._liked_by) ? 'unsave' : 'save'} size='xs' placement='top' rounded='md'>
                    <IconButton
                        aria-label="save message"
                        icon={checkLiked(message._liked_by) ? <IoBookmark fontSize={'0.8rem'} /> : <IoBookmarkOutline fontSize={'0.8rem'} />}
                        size='xs'
                        onClick={() => handleLike(message.name, checkLiked(message._liked_by) ? 'No' : 'Yes')} />
                </Tooltip>
                {file &&
                    <Tooltip hasArrow label='download' size='xs' placement='top' rounded='md'>
                        <IconButton
                            as={Link}
                            href={file}
                            isExternal
                            aria-label="download file"
                            icon={<BsDownload />}
                            size='xs' />
                    </Tooltip>
                }
                {(owner === currentUser) &&
                    <Tooltip hasArrow label='delete' size='xs' placement='top' rounded='md'>
                        <IconButton
                            onClick={onDeleteMessageModalOpen}
                            aria-label="delete message"
                            icon={<VscTrash fontSize={'0.9rem'} />}
                            size='xs' />
                    </Tooltip>
                }
            </HStack>
            <DeleteMessageModal
                isOpen={modalManager.modalType === ModalTypes.DeleteMessage}
                onClose={modalManager.closeModal}
                channelMessageID={name}
            />
            {text &&
                <EditMessageModal
                    isOpen={modalManager.modalType === ModalTypes.EditMessage}
                    onClose={modalManager.closeModal}
                    channelMessageID={name}
                    originalText={text}
                />
            }
        </Box>
    )
}

interface EmojiButtonProps {
    emoji: string,
    label: string,
    onClick?: () => void
}

const EmojiButton = ({ emoji, label, onClick }: EmojiButtonProps) => {
    return (
        <Tooltip hasArrow label={label} size='xs' placement='top' rounded='md'>
            <Button size='xs' fontSize='md' onClick={onClick}>
                {emoji}
            </Button>
        </Tooltip>
    )
}