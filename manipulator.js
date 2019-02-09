import {html, render} from "https://unpkg.com/lit-html?module";
import {Split, Merge} from "./schemer.js";

const Methods = (inUpdate) => 
{
    return {
        EditStart:(inNode)=>
        {
            var i;
            inNode.State.Edit = true;
            for(i=0; i<inNode.Leaves.length; i++)
            {
                inNode.Leaves[i].Copy = inNode.Leaves[i].Value;
            }
            inUpdate();
        },
        EditCancel:(inNode)=>
        {
            inNode.State.Edit = false;
            inUpdate();
        },
        EditSave:(inNode)=>
        {
            var i;
            inNode.State.Edit = false;
            for(i=0; i<inNode.Leaves.length; i++)
            {
                inNode.Leaves[i].Value = inNode.Leaves[i].Copy;
            }
            inUpdate();
        },
        BranchAdd:(inBranch)=>
        {
            inBranch.Value.unshift( JSON.parse(JSON.stringify(inBranch.Copy)) );
            inUpdate();
        },
        BranchDelete:(inBranch, inIndex)=>
        {
            inBranch.Value.splice(inIndex, 1);
            inUpdate();
        }
    }
};

export const App = (inModel, inSchema, inPattern, inRoot) =>
{
    var merge = Merge(inModel, inSchema, inPattern);
    var _Node = (inMerged) =>
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
                <button @click=${() => methods.EditSave(inMerged)}>OK</button>
                <button @click=${() => methods.EditCancel(inMerged)}>Cancel</button>
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
                <button @click=${() => methods.EditStart(inMerged)}>Edit</button>
                ${inMerged.Branches.map( (inItem)=>
                {
                    return html`
                    <div class="Branch">
                        ${inItem.Key}:
                        <button @click=${() => methods.BranchAdd(inItem)}>Add</button>
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
    }
    var Redraw = () =>
    {
        render(_Node(merge), inRoot);
    }
    var methods = Methods(Redraw);
    Redraw();
};

