import React, { useState } from "react";
import { useStorage } from "@plasmohq/storage/hook"
import type {
    PlasmoCSConfig,
    PlasmoCSUIJSXContainer,
    PlasmoRender
} from "plasmo"
import { createRoot } from "react-dom/client"
import { Modal, Table} from "antd";
import {fetchRepoData} from "../service"

export const config: PlasmoCSConfig = {
    matches: ["https://github.com/*"]
}

export const getRootContainer = () =>
    new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            const rootContainerParent = document.querySelector(`#repository-details-container > ul`)
            if (rootContainerParent) {
                clearInterval(checkInterval)
                const rootContainer = document.createElement("li")
                const referenceNode = rootContainerParent.children[0];
                if (referenceNode) {
                    rootContainerParent.insertBefore(rootContainer, referenceNode);
                } else {
                    rootContainerParent.appendChild(rootContainer);
                }
                resolve(rootContainer)
            }
        }, 137)
    })

const PlasmoOverlay = (prop:any) => {
    const columns = [
        {
          title: 'Repo',
          dataIndex: 'repo',
          key: 'repo',
        },
        {
          title: 'owner',
          dataIndex: 'owner',
          key: 'owner',
        },
        {
          title: 'stars',
          dataIndex: 'stars',
          key: 'stars',
        },
        {
          title: 'forks',
          dataIndex: 'forks',
          key: 'forks',
        },
        {
          title: 'open issues',
          dataIndex: 'open_issues',
          key: 'open_issues',
        },
        {
          title: 'Created At',
          dataIndex: 'created_at',
          key: 'created_at',
        },
        {
          title: 'Updated At',
          dataIndex: 'updated_at',
          key: 'updated_at',
        },
    ]
    const {data} = prop;
    const [isModalOpen, setIsModalOpen] = useStorage("isModalOpen");
    
    const handleCancel = () => {
      setIsModalOpen(false);
    };

    return (
        <div className="float-left">
            {/* <button onClick={showModal} className="btn-sm btn">
            Compare
            </button> */}
            <Modal title="Repo Comparer" open={isModalOpen} onCancel={handleCancel} footer={null} width={1000} style={{top: 150}}>
                <Table columns={columns} dataSource={data} rowKey={record=>`${record.owner}/${record.repo}`} pagination={false} />
            </Modal>
        </div>
    )
}

export const render: PlasmoRender<PlasmoCSUIJSXContainer> = async ({
    createRootContainer
}) => {
    const rootContainer = await createRootContainer()
    const root = createRoot(rootContainer)
    const res = await fetchRepoData();
    root.render(<PlasmoOverlay data={res}/>)
}