import React from "react";
import { useModal } from "./ModalContext";
import ReleaseModal from "./ReleaseModal";

const Home = () => {
    const { isModalOpen, openModal, closeModal } = useModal();

    return (
        <div>
            <button onClick={openModal}>Open Modal</button>
            {isModalOpen && (
                <ReleaseModal onClose={closeModal}>
                    <h2>This is a Modal</h2>
                    <p>This is a release note.</p>
                </ReleaseModal>
            )}
        </div>
    );
};