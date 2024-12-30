export default class NodeService {
  getTreeTableNode = async () => {
    return fetch('/data/treetablenode.json')
      .then((res) => res.json())
      .then((d) => d.root);
  };

  getTreeNode = async () => {
    return fetch('/data/treenode.json')
      .then((res) => res.json())
      .then((d) => d.root);
  };
}
