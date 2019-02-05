
export const Merge = (inModel, inSchema, inPattern)=>
{
    var i;
    var output, property;
    var pattern;
    var patternKey, patternValue, modelValue;

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

        property = {
            Key:patternKey,
            Value:modelValue,
            Annotation:patternValue
        };

        if(patternValue.type === "array")
        {
            var replacement = [];
            //replace the array of objects inValue with an array of merged objects
            for(i=0; i<modelValue.length; i++)
            {
                replacement.push( Merge(modelValue[i], inSchema, patternValue.settings) );
            }
            property.Value = replacement;
            output.Branches.push(property);
        }
        else
        {
            output.Leaves.push(property);
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
