import {html, render} from 'https://unpkg.com/lit-html?module';

const CRUD = {
    Create:(inList, inIndex, inObject) =>
    {
        console.log("CRUDCreate", inList, inObject);
        inList.unshift(JSON.parse(JSON.stringify(inObject)) );
        AppUpdate();
    },
    Update:(inList, inIndex, inObject) =>
    {
        inList[inIndex] = inObject;
        AppUpdate();
    },
    Delete:(inList, inIndex) =>
    {
        inList.splice(inIndex, 1);
        AppUpdate();
    },
    Duplicate:(inList, inIndex) =>
    {
        inList.splice( inIndex, 1, JSON.parse(JSON.stringify(inList[inIndex])) );
        AppUpdate();
    }
};

var Editor = {
    Edit:false,
    Leaves:[],
};
Editor.EditSelect = (inLeaves) =>
{
    Editor.Leaves = inLeaves;
    AppUpdate();
};
Editor.EditStart = () =>
{
    var i, leaf;
    Editor.Edit = true;
    for(i in Editor.Leaves)
    {
        leaf = Editor.Leaves[i];
        leaf.Copy = leaf.Value;
    }
    AppUpdate();
};
Editor.EditCancel = () =>
{
    Editor.Edit = false;
    AppUpdate();
};
Editor.EditSave = () =>
{
    var i, leaf;
    Editor.Edit = false;
    for(i in Editor.Leaves)
    {
        leaf = Editor.Leaves[i];
        leaf.Value = leaf.Copy;
        leaf.Object[leaf.Key] = leaf.Copy;
    }
    AppUpdate();
};


export var AppModel = {
    prop1:true,
    prop2:"ok",
    deep:[]
};
export var AppSchema =
{
    prop1:{type:"string", display:"Propery One", default:"default string"},
    prop2:{type:"string", display:"Propery Two", default:"default string"},
    prop3:{type:"string", display:"Propery Three"},
    deep:{type:"array", display:"Array One", default:[{childProp:"d1"}, {childProp:"d2"}], settings:{
        childProp1:{type:"string", display:"Child Property1", default:"child property string"},
        childProp2:{type:"string", display:"Child Property2", default:"child property string"}
    }}
};
export const AppUpdate = () =>
{
    AppView(AppModel, AppSchema, document.querySelector("#App"));
};
const AppView = (inModel, inSchema, inRoot) =>
{
    render(html`
    <div class="Columns">
        <div class="Column Tree">
        ${_Node(inModel, inSchema)}
        </div>
        <div class="Column Editor">
        ${_Editor(Editor)}
        </div>
    </div>`
    , inRoot);
};
const _Editor = (inEditor) =>
{
    if(inEditor.Edit)
    {
        return html`
        <form @submit=${(inEvent)=>{ inEvent.preventDefault();inEditor.EditSave(); }}>
        ${inEditor.Leaves.map((inItem, inIndex, inArray)=>
        {
            return html`
            <div class="Field Leaf">
                ${inItem.Display}: <input type="text" value=${inItem.Copy} @input=${(inEvent)=>{inItem.Copy = inEvent.target.value;}} />
            </div>
            `;
        })}
            <button @click=${() => { inEditor.EditSave();}}>OK</button>
            <button @click=${() => { inEditor.EditCancel();}}>Cancel</button>
        </form>`;
    }
    else
    {
        return html`
        <div>
        ${inEditor.Leaves.map((inItem, inIndex, inArray)=>
        {
            return html`
            <div class="Field Leaf">
                ${inItem.Display}: ${inItem.Value}
            </div>
            `;
        })}
            <button @click=${() => { inEditor.EditStart();}}>Edit</button>
        </div>`;
    }
};
const _Node = (inModel, inSchema) =>
{
    console.log("node got", inModel, inSchema);
    var key, value;
    var leaves, branches;
    var mapper;
    leaves = [];
    branches = [];
    for(key in inSchema)
    {
        value = inSchema[key];

        mapper = {
            Key:key,
            Value:inModel[key]||value.default||"NA",
            Object:inModel,
            Type:value.type,
            Display:value.display||key,
            Default:value.default,
            Settings:value.settings
        };

        if(value.type === "array")
        {
            branches.push(mapper);
        }
        else
        {
            mapper.Copy = "";
            leaves.push(mapper);
        }
        
    }

    return html`
    <div class="Node">
        <button @click=${() => Editor.EditSelect(leaves)}>Show fields</button>
        <hr>
        ${branches.map( inMapper => _List(inMapper) )}
    </div>`;
};
const _List = (inMapper) =>
{
    var key, value;
    var computedDefault = {};
    for(key in inMapper.Settings)
    {
        value = inMapper.Settings[key].default;
        computedDefault[key] = value;
    }

    console.log("list got", computedDefault);
    return html`
    <div class="List">
        <button @click=${() => {CRUD.Create(inMapper.Value, 0, computedDefault)}}>Add</button>
        ${inMapper.Value.map( inItem => _Node(inItem, inMapper.Settings) )}
    </div>`;
};

AppUpdate();