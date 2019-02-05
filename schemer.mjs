
export const Merge = (inModel, inSchema, inPattern)=>
{
    var i;
    var output, property;
    var pattern, patternKey, patternValue, modelValue;
    var replacement;
    var childPattern, childPatternKey, childPatternValue;


    pattern = inSchema[inPattern];
    output = {
        Leaves:[],
        Branches:[],
        State:{
            Edit:false,
            Collapsed:false,
        },
        Methods:{
            EditStart:()=>
            {
                var i;
                output.State.Edit = true;
                for(i=0; i<output.Leaves.length; i++)
                {
                    output.Leaves[i].Copy = output.Leaves[i].Value;
                }
            },
            EditCancel:()=>
            {
                output.State.Edit = false;
            },
            EditSave:()=>
            {
                var i;
                output.State.Edit = false;
                for(i=0; i<output.Leaves.length; i++)
                {
                    output.Leaves[i].Value = output.Leaves[i].Copy;
                }
            }
        }
    };
    for(patternKey in pattern)
    {
        patternValue = pattern[patternKey];
        modelValue = inModel[patternKey]||patternValue.default||"-NA-";

        property = { Key:patternKey, Value:modelValue, Annotation:patternValue, Copy:"" };

        if(patternValue.type !== "array")
        {
            output.Leaves.push(property);
        }
        else
        {
            //do a merge the child objects in this branch
            replacement = [];
            for(i=0; i<modelValue.length; i++)
            {
                replacement.push( Merge(modelValue[i], inSchema, patternValue.settings) );
            }
            property.Value = replacement;
            property.Copy = {};
            childPattern = inSchema[patternValue.settings];
            
            for(childPatternKey in childPattern)
            {
                childPatternValue = childPattern[childPatternKey];
                property.Copy[childPatternKey] = childPatternValue.default;
            }
            property.Copy = Merge(property.Copy, inSchema, patternValue.settings);
            output.Branches.push(property);
        }

    }
    return output;
};

export const Split = (inMerge)=>
{
    var i, j;
    var item;
    var obj;
    var array;
    obj = {};
    for(i=0; i<inMerge.Leaves.length; i++)
    {
        item = inMerge.Leaves[i];
        obj[item.Key] = item.Value;
    }
    for(i=0; i<inMerge.Branches.length; i++)
    {
        array = [];
        item = inMerge.Branches[i];
        for(j=0; j<item.Value.length; j++)
        {
            array.push( Split(item.Value[j]) );
        }
        obj[item.Key] = array;
    }
    return obj;
};
