import React, { useState } from "react";
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
          title: 'watches',
          dataIndex: 'watches',
          key: 'watches',
        },
    ]
    const {data, repo} = prop;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => {
      setIsModalOpen(true);
    };

    const handleCancel = () => {
      setIsModalOpen(false);
    };

    return (
        <div className="float-left">
            <button onClick={showModal} className="btn-sm btn">
            Compare
            </button>
            <Modal title="Repo Comparer" open={isModalOpen} onCancel={handleCancel} footer={null}>
                    <p>{repo}</p>
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
    const owner = "microsoft";
    const repo = "vscode";
    const res = await fetchRepoData(owner, repo);
    const data = [{
        ...res,
        owner: owner,
        repo: repo,
    }]
    root.render(<PlasmoOverlay data={data}/>)
}