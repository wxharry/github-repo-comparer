import React, { useEffect, useState } from "react";
import { useStorage } from "@plasmohq/storage/hook"
import type {
    PlasmoCSConfig,
    PlasmoCSUIJSXContainer,
    PlasmoRender
} from "plasmo"
import { createRoot } from "react-dom/client"
import { Modal, Table, Space, Button, Input, message} from "antd";
import { fetchRepoData, fetchRepoListData} from "../service"
import { Storage } from "@plasmohq/storage"
import { validateAndExtractRepoInfo } from "~utils/utils";
import { error } from "console";
 
const storage = new Storage()

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
    const [repoList, setRepoList] = useStorage("repoList");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [repoData, setRepoData] = useState([]);
    const [selectedRepo, setSelectedRepo] = useState([]);
    const [inputVal, setInputVal] = useState("");
    const [inputErrMsg, setInputErrMsg] = useState("");

    const handleCancel = () => {
      setIsModalOpen(false);
    };
    useEffect(()=>{
        const fetchData = async () => {
            try {
                const result = await fetchRepoListData(repoList)
                setRepoData(result);
              } catch (error) {
                console.error("Error fetching data:", error);
              }
        }
        if (repoList && repoList.length > 0) {
            fetchData()
        } else {
            setRepoData([])
        }
    }, [repoList])

    const rowSelection = {
        onChange: (_, selectedRows) => {
            setSelectedRepo(selectedRows);
        },
      };

    const removeRepo = () => {
        const newRepoList = repoList.filter(item => 
            !selectedRepo.some(selectedItem => 
              selectedItem.repo === item.repo && selectedItem.owner === item.owner
            )
          );
        setRepoList(newRepoList);
    }

    const onChagneInput = (e) => {
        setInputVal(e.target.value)
        setInputErrMsg("");
    }

    const onClickAdd = async () => {
        const inputRepo = validateAndExtractRepoInfo(inputVal);
        if (!inputRepo) {
            setInputErrMsg("Cannot correctly parse repository name")
            message.error("Cannot correctly parse repository name", 2, ()=>{
            })
            return;
        } // set input status to warning
        fetchRepoData(inputRepo).then(res => {
            const isItemInList = repoList.some(item => item.owner === res.owner && item.repo === res.repo);
            if (!isItemInList) {
                setRepoList(prevRepoList => [...prevRepoList, res]);
                setInputVal('');
                setInputErrMsg('');
                return;
            }
        }).catch(() => {
            setInputErrMsg("Cannot fetch repository data")
            message.error("Cannot fetch repository data", 2, ()=>{
            })
        })
    }

    chrome.runtime.onMessage.addListener((req, _, sendResponse) => {
        if (req.name == 'openModal'){
            setIsModalOpen(true)           
        }
        return true;
    })
    
    return (
        <div className="float-left">
            <Modal title="Repo Comparer" open={isModalOpen} onCancel={handleCancel} footer={null} width={1000} style={{top: 150}} keyboard>
                <div style={{minHeight: 350}}>
                <Space style={{ marginBottom: 16 }}>
                    <Input onChange={onChagneInput} value={inputVal} allowClear onPressEnter={inputVal === '' ? null : onClickAdd}
                        status={inputErrMsg === "" ? "" : "error"} addonAfter={
                            <Button type="link" onClick={onClickAdd} size="small" disabled={inputVal === ''}>Add</Button>
                        }
                    />
                    <Button onClick={removeRepo} danger disabled={selectedRepo?.length === 0} >Remove</Button>
                </Space>
                    <Table 
                        columns={columns} dataSource={repoData} rowKey={record=>`${record.owner}/${record.repo}`}
                        pagination={false}  
                        rowSelection={{
                            type: "checkbox",
                            ...rowSelection,
                          }}
                        />
                </div>
            </Modal>
        </div>
    )
}

export const render: PlasmoRender<PlasmoCSUIJSXContainer> = async ({
    createRootContainer
}) => {
    const rootContainer = await createRootContainer()
    const root = createRoot(rootContainer)
     
    root.render(<PlasmoOverlay/>)
}