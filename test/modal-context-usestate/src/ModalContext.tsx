import React, { createContext, useState, useContext } from "react";

// Context 생성 (null 방지)
const ModalContext = createContext<{
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
} | null > (null);

// Context Provider 정의 
export const ModalProvider = ({ children }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <ModalContext.Provider value={{ isModalOpen, openModal, closeModal }}>
            {children}
        </ModalContext.Provider>
    );
};

// Context Consumer (ModalContext.Consumer)
export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
};