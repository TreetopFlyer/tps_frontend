import {html, render} from "https://unpkg.com/lit-html?module";
import {Split, Merge} from "./schemer.js";

const History = {};
History.Stack = [];
History.Index = 0;
History.Push = (inName, inObject) =>
{
    History.Stack.push({
        Type:inName,
        State:JSON.stringify(inObject)
    });
};
History.Recall = (inIndex) =>
{

};

const Methods = {
    EditStart:(inNode)=>
    {
        var i;
        inNode.State.Edit = true;
        for(i=0; i<inNode.Leaves.length; i++)
        {
            inNode.Leaves[i].Copy = inNode.Leaves[i].Value;
        }
        AppUpdate();
    },
    EditCancel:(inNode)=>
    {
        inNode.State.Edit = false;
        AppUpdate();
    },
    EditSave:(inNode)=>
    {
        var i;
        inNode.State.Edit = false;
        for(i=0; i<inNode.Leaves.length; i++)
        {
            inNode.Leaves[i].Value = inNode.Leaves[i].Copy;
        }
        AppUpdate();
    },
    BranchAdd:(inBranch)=>
    {
        inBranch.Value.unshift( JSON.parse(JSON.stringify(inBranch.Copy)) );
        AppUpdate();
    },
    BranchDelete:(inBranch, inIndex)=>
    {
        inBranch.Value.splice(inIndex, 1);
        AppUpdate();
    }
};

const _Node = (inMerged) =>
{
    if(inMerged.State.Edit)
    {
        return html`
        <form class="Node" @submit=${(inEvent)=>{inEvent.preventDefault();}}>
            ${inMerged.Leaves.map( (inItem)=>
            {
                return html`
                <div class="Leaf">
                    ${inItem.Key}: <input type="text" value=${inItem.Copy} @input=${(inEvent)=>{inItem.Copy = inEvent.target.value;}}/>
                </div>
                `;
            }) }
            <button @click=${() => Methods.EditSave(inMerged)}>OK</button>
            <button @click=${() => Methods.EditCancel(inMerged)}>Cancel</button>
        </form>
        `;
    }
    else
    {
        return html`
        <div class="Node">
            ${inMerged.Leaves.map( (inItem)=>
            {
                return html`
                <div class="Leaf">
                    ${inItem.Key}: ${inItem.Value}
                </div>
                `;
            }) }
            <button @click=${() => Methods.EditStart(inMerged)}>Edit</button>
            ${inMerged.Branches.map( (inItem)=>
            {
                return html`
                <div class="Branch">
                    ${inItem.Key}:
                    <button @click=${() => Methods.BranchAdd(inItem)}>Add</button>
                    ${inItem.Value.map( (inMember)=>
                    {
                        return _Node(inMember);
                    } )}
                </div>
                `;
            })}
        </div>
        `;
    }
};
const AppUpdate = () =>
{
    render(_Node(AppModel), AppRoot);
};

var AppModel;
var AppRoot;

export const App = (inModel, inSchema, inPattern, inRoot) =>
{
    AppModel = Merge(inModel, inSchema, inPattern);
    AppRoot = inRoot;

    console.log(AppModel);
    AppUpdate();
};

