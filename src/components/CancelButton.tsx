export function CancelButton() {
    return (
        <button onClick={() => history.back()} type="button">
            Cancel
        </button>
    );
}
