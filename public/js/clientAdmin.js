const deleteProduct = e => {
    const productId = e.target.parentNode.querySelector('[name=productId]').value;
    const csrf = e.target.parentNode.querySelector('[name=_csrf]').value;

    const productCard = e.target.parentNode.parentNode;
    // console.log(productCard);

    fetch(`/admin/delete-product/${productId}`, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrf
        }
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        console.log(data);
        productCard.remove();
    })
    .catch(err => {
        console.log(err);
    })
};

document.querySelectorAll('.delete-product-button').forEach(current => {
    current.addEventListener('click', deleteProduct);
});

