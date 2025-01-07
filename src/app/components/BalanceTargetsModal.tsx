import { Modal, Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { BalanceTargets } from "./BalanceTarget";

export const BalanceTargetsModal = ({ open, onClose }: { open: boolean, onClose: () => void }) => {
    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', maxWidth: '600px', bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
                <BalanceTargets />
            </Box>
        </Modal>
    );
};
