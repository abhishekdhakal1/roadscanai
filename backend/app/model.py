import torch.nn as nn
from torchvision import models


def get_model(num_classes=4):
    model = models.mobilenet_v2(weights=None)

    in_features = model.classifier[1].in_features

    model.classifier = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(in_features, num_classes),
    )

    return model
