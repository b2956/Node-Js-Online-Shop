const sum = (a, b) => {
    if(a && b) {
        return a + b;
    }
    throw new Error('Invalid arguments');
    
};

try {
    console.log(sum(1));
} catch (error) {
    console.log('Error ocurred!');
    // console.log(error);
}
 
console.log('This Works');