import { Avatar, AvatarBadge, AvatarGroup, Button, ButtonGroup, Icon, IconButton, Tooltip } from "@chakra-ui/react"
import { useContext } from "react"
import { RiUserAddLine, RiUserLine } from "react-icons/ri"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"

interface ViewOrAddMembersButtonProps {
    onClickViewMembers: () => void,
    onClickAddMembers: () => void,
    activeUsers: string[]
}

export const ViewOrAddMembersButton = ({ onClickViewMembers, onClickAddMembers, activeUsers }: ViewOrAddMembersButtonProps) => {

    const { channelData, channelMembers } = useContext(ChannelContext)
    const members = Object.values(channelMembers)

    return (
        <ButtonGroup isAttached size='sm' variant='outline'>
            <Tooltip hasArrow label='view members/ channel details' placement='bottom-start' rounded={'md'}>
                <Button onClick={onClickViewMembers} w='fit-content' pr='2' pl='1'>
                    {members.length > 0 ? <AvatarGroup size='xs' max={2} borderRadius='md' spacing={-1} fontSize='2xs'>
                        {members.map((member) => (
                            <Avatar key={member.name} name={member.full_name} src={member.user_image} borderRadius='md'>
                                {activeUsers.includes(member.name) && <AvatarBadge boxSize='0.88em' bg='green.500' />}
                            </Avatar>
                        ))}
                    </AvatarGroup> :
                        <Icon as={RiUserLine} ml='1' />}
                </Button>
            </Tooltip>
            {(channelData?.type === 'Private' || channelData?.type === 'Public') &&
                <Tooltip hasArrow label='add members' placement='bottom-start' rounded={'md'}>
                    <IconButton
                        onClick={onClickAddMembers}
                        aria-label={"add members to channel"}
                        icon={<RiUserAddLine />}
                    />
                </Tooltip>
            }
        </ButtonGroup>
    )
}