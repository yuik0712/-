import React from "react";
import styled from "styled-components";
import { useModal } from "./ModalContext"; // useModal 사용

const ReleaseModal = () => {
  const { closeModal } = useModal(); // 컨텍스트에서 닫기 함수 가져오기

  return (
    <>
      <Layer onClick={closeModal} />
      <ModalLayer>
        <h2>모달 창</h2>
        <button onClick={closeModal}>닫기</button>
      </ModalLayer>
    </>
  );
};

export default ReleaseModal;

// 스타일 컴포넌트
const Layer = styled.div`
  z-index: 1500;
  display: block;
  background: rgba(0, 0, 0, 0.3);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const ModalLayer = styled.div`
  z-index: 2000;
  width: 400px;
  height: 600px;
  background: white;
  padding: 20px;
  border-radius: 10px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;