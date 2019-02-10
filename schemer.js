export const Merge = (inModel, inSchema, inPattern)=>
{
    var i;
    var output, property;
    var patternKey, patternValue, modelValue;
    var replacement;
    var childPattern, childPatternKey, childPatternValue;

    // Given a model object and a pattern object, we want to match their fields and return a new object that has:
    // an annotated set of leaf-level fields and a set of branching fields that the pattern either matched on the model object or added by default if no matching field could be found.
    // each of these annotated fields, called a property object, will have:
    // - Key: the name of the field on *pattern* object
    // - Value: the result of looking up the Key on the model object, or the pattern default if none exists, or "-NA-" if there's no default on the pattern
    // - Copy : a local storage that is used in editing leaf fields, or to store an object that can be copied into branch fields array.
    // - Annotation: a reference to the pattern field used in the comparison.

    output = {
        Leaves:[],
        Branches:[],
        State:{
            Edit:false,
            Collapsed:false,
            Selected:false,
        }
    };
    for(patternKey in inPattern)
    {
        patternValue = inPattern[patternKey];
        modelValue = inModel[patternKey]||patternValue.default||"-NA-";
        
        property = {
            Key: patternValue.display||patternKey, 
            Value: modelValue||patternValue.default,
            Copy: "",
            Annotation: patternValue
        };

        // flatten group objects
        if(patternValue.type === "group")
        {
            var drillDown = Merge(property.Value, inSchema, patternValue.settings);
            var rename = (inItem) =>{inItem.Key = property.Key + "." + inItem.Key;};
            drillDown.Leaves.forEach((inItem)=>{
                rename(inItem);
                output.Leaves.push(inItem);
            });
            drillDown.Branches.forEach((inItem)=>{
                rename(inItem);
                output.Branches.push(inItem);
            });

            output.Leaves.concat(drillDown.Leaves);
            output.Branches.concat(drillDown.Branches);
            continue;
        }

        // if its a branch field, we have to modify the Value and Copy properties.
        // branch fields require a "settings" property that is a reference to the pattern that should be used on its children
        if(patternValue.type === "array")
        {
            childPattern = inSchema[patternValue.settings];

            // Value will be replaced with an array that is the result of the original objects merged with the "settings" pattern
            replacement = [];
            for(i=0; i<modelValue.length; i++)
            {
                replacement.push( Merge(property.Value[i], inSchema, childPattern) );
            }
            property.Value = replacement;

            // Copy will be set to an object derived from defaults mentioned in the "settings" pattern. This derived object is then merged with that pattern.
            replacement = {};
            for(childPatternKey in childPattern)
            {
                childPatternValue = childPattern[childPatternKey];
                replacement[childPatternKey] = childPatternValue.default;
            }
            property.Copy = Merge(replacement, inSchema, childPattern);

            output.Branches.push(property);
            continue;
        }

        // if its a leaf field, we don't have to do anything to the property object. just add it to Leaves.
        output.Leaves.push(property);

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