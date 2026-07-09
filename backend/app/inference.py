import torch
from app.model import get_model

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

idx_to_class = {
    0: "High",
    1: "Low",
    2: "Medium",
    3: "Normal",
}

model = get_model(num_classes=4)

state_dict = torch.load(
    "models/lr_3_img_160.pth",
    map_location=device,
    weights_only=True,
)

model.load_state_dict(state_dict)
model.to(device)
model.eval()
