import { useState } from "react"
import type { PlasmoCSConfig } from "plasmo"
import { Modal, Button } from "antd"

export const config: PlasmoCSConfig = {
  matches: ["https://github.com/*"],
}

export const getStyle = () => {
  const style = document.createElement("style")
  return style
}

const PlasmoOverlay = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => {
      setIsModalOpen(true);
    };
  
    const handleOk = () => {
      setIsModalOpen(false);
    };
  
    const handleCancel = () => {
      setIsModalOpen(false);
    };
    return (
        <>
        <button onClick={showModal}>
          Open Modal
        </button>
        <Modal title="Basic Modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Modal>
      </>
    )
}

export default PlasmoOverlay