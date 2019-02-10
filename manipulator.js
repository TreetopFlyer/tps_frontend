import {html, render} from "https://unpkg.com/lit-html?module";
import {Split, Merge} from "./schemer.js";

const History = {};
History.Stack = [];
History.Index = 0;
History.Push = (inName) =>
{
    if(History.Index != History.Stack.length)
    {
        // we are viewing a past edit. cut the end off before adding the changes
        History.Stack.splice(History.Index+1);
    }
    History.Stack.push({
        Type:inName,
        State:JSON.stringify(AppModel)
    });
    if(History.Stack.length > 10)
    {
        History.Stack.shift();
    }
    History.Index = History.Stack.length-1;
};
History.Recall = (inIndex) =>
{
    History.Index = inIndex;
    AppModel = JSON.parse(History.Stack[inIndex].State);
    AppUpdate();
};

const AppStore = {};
AppStore.Dispatch = (inType, inPath) =>
{
     switch(inType)
     {
        case "Edit Start" :

            break;
        case "Edit Cancel" :
            break;
        case "EditSave" :
            break;
        case "ArrayAdd" :
            break;
        case "ArrayDelete" :
            break;
        case "ArrayDuplicate" :
            break;
     }
};

const ResolvePath = (inPath) =>
{
    var i;
    var output;
    output = {};
    output.Node = AppModel;
    output.Array = output.Node.Branches[inPath[0]];
    output.Member = output.Array.Value[inPath[1]];
    for(i=2; i<inPath.length; i+=2)
    {
        output.Node = output.Member;
        output.Array = output.Member.Branches[inPath[i]];
        output.Member = output.Array.Value[inPath[i+1]];
    }
    output.ArrayIndex = inPath[inPath.length-2];
    output.MemberIndex = inPath[inPath.length-1];
    return output;
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
        History.Push("Edit");
        AppUpdate();
    },
    BranchAdd:(inPath)=>
    {
        var location;
        location = ResolvePath(inPath);
        console.log(location);
        location.Array.Value.unshift( JSON.parse(JSON.stringify(location.Array.Copy)) );
        History.Push("Create");
        AppUpdate();
    },
    BranchDelete:(inPath)=>
    {
        var location;
        location = ResolvePath(inPath);
        location.Array.Value.splice(location.MemberIndex, 1);
        History.Push("Delete");
        AppUpdate();
    }
};


const _Layout = () =>
{
    return html`
    <div>
        <h3>History</h3>
        ${_History()}
        <h3>Editor</h3>
        ${_Node(AppModel, [])}
    </div>
    `;
}
const _Node = (inMerged, inPath) =>
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
            <div>
            ${inPath.map( (inNumber, inIndex)=>{

                if(inIndex % 2 === 0)
                {
                    return ">"+inNumber+".";
                }
                else
                {
                    return inNumber+" ";
                }
            } )}
            </div>
            ${inMerged.Leaves.map( (inItem)=>
            {
                return html`
                <div class="Leaf">
                    ${inItem.Key}: ${inItem.Value}
                </div>
                `;
            }) }
            <button @click=${() => Methods.EditStart(inMerged)}>Edit</button>
            <button @click=${() => Methods.BranchDelete(inPath)}>Delete</button>
            ${inMerged.Branches.map( (inBranch, inBranchIndex)=>
            {
                var pathExtended;
                pathExtended = inPath.concat([inBranchIndex]);
                return html`
                <div class="Branch">
                    ${inBranch.Key}:
                    <button @click=${() => Methods.BranchAdd(pathExtended)}>Add</button>
                    ${inBranch.Value.map( (inMember, inMemberIndex)=>
                    {
                        pathExtended.concat[inMemberIndex];
                        return _Node(inMember, pathExtended);
                    } )}
                </div>
                `;
            })}
        </div>
        `;
    }
};
const _History = () =>
{
    return html`
    <ul>
        ${History.Stack.map( (inItem, inIndex)=>{
            return html`
            <li @click=${ ()=>{console.log(inIndex); History.Recall(inIndex);} }>${inItem.Type}</li>
            `;
        } )}
    </ul>
    `;
};
const AppUpdate = () =>
{
    render(_Layout(), AppRoot);
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

