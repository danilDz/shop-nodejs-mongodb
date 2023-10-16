const deleteProduct = async (btn) => {
    const productId = btn.parentNode.querySelector("[name=productId]").value,
        csrfToken = btn.parentNode.querySelector("[name=_csrf]").value,
        productElement = btn.closest('article');

    fetch(`/admin/product/${productId}`, {
        method: "DELETE",
        headers: {
            "csrf-token": csrfToken,
        },
    })
        .then(async (result) => {
            return result.json();
        })
        .then(data => {
            productElement.parentNode.removeChild(productElement);
        })
        .catch((err) => console.log(err));
};
