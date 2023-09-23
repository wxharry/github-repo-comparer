import { useStorage } from "@plasmohq/storage/hook"
import { Button, Input, Table } from "antd"

import { useState } from "react"

function IndexPopup() {
  const [_, setIsModalOpen] = useStorage("isModalOpen", (v) => v === undefined ? false: v)
  const onClickShowDetail = () => {
    setIsModalOpen(true);
  }
  const onClickAddCurrent = (e) => {

  }
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}>
        <Button onClick={onClickShowDetail} type="text">Show in detail</Button>
        <Button onClick={onClickAddCurrent} type="text"> Add current </Button>
    </div>
  )
}

export default IndexPopup