<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkout</title>
    <script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.development.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        function Checkout() {
            const [appointmentId, setAppointmentId] = React.useState('');
            const [price, setPrice] = React.useState('');
            const [paymentMethod, setPaymentMethod] = React.useState('cash');
            const [error, setError] = React.useState(null);
            const [loading, setLoading] = React.useState(false);

            const handleSubmit = async (e) => {
                e.preventDefault();
                setLoading(true);
                setError(null);

                try {
                    const response = await axios.post('/api/bookings', {
                        appointment_id: appointmentId,
                        price: parseFloat(price),
                        payment_method: paymentMethod,
                    }, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    });

                    if (paymentMethod === 'khalti' && response.data.payment_url) {
                        window.location.href = response.data.payment_url;
                    } else if (paymentMethod === 'esewa' && response.data.form_url) {
                        const form = document.createElement('form');
                        form.method = 'POST';
                        form.action = response.data.form_url;
                        Object.entries(response.data.form_data).forEach(([key, value]) => {
                            const input = document.createElement('input');
                            input.type = 'hidden';
                            input.name = key;
                            input.value = value;
                            form.appendChild(input);
                        });
                        document.body.appendChild(form);
                        form.submit();
                    } else {
                        window.location.href = '/payment/success';
                    }
                } catch (err) {
                    setError(err.response?.data?.error || 'Failed to process booking');
                    setLoading(false);
                }
            };

            return (
                <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-6 text-center">Checkout</h2>
                    {error && <div className="text-red-500 mb-4">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Appointment ID</label>
                            <input
                                type="text"
                                value={appointmentId}
                                onChange={(e) => setAppointmentId(e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price</label>
                            <input
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            >
                                <option value="cash">Cash</option>
                                <option value="khalti">Khalti</option>
                                <option value="esewa">eSewa</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {loading ? 'Processing...' : 'Confirm Booking'}
                        </button>
                    </form>
                </div>
            );
        }

        ReactDOM.render(<Checkout />, document.getElementById('root'));
    </script>
</body>
</html>