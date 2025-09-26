import { Box } from 'ink';

interface ModalLayoutProps {
    children: React.ReactNode;
    width?: string | number;
}

const ModalLayout = ({ children, width = '80%' }: ModalLayoutProps) => {
    return (
        <Box
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            width="100%"
            height="100%"
        >
            <Box
                flexDirection="column"
                paddingY={1}
                width={width}
                backgroundColor="black"
            >
                {children}
            </Box>
        </Box>
    );
};

export default ModalLayout;